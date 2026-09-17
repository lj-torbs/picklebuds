import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Layers3,
  ListPlus,
  Loader2,
  Medal,
  Plus,
  Save,
  Shuffle,
  Swords,
  Trophy,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import {
  getOwnerTournamentsWithApi,
  getOwnerVenuesWithApi,
  saveOwnerTournamentWithApi,
  type OwnerTournamentApiItem,
  type OwnerTournamentMatchApiItem,
  type OwnerTournamentSaveInput,
} from "@/lib/owner-api"
import { cn } from "@/lib/utils"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"

type Participant = {
  id: string
  name: string
  rating: number
  division: string
}

type MatchSlot = {
  participantId?: string
  name: string
  seed?: number
  rating?: number
  source?: string
}

type MatchTarget = {
  roundIndex: number
  matchIndex: number
  slot: "a" | "b"
}

type TournamentMatch = {
  id: string
  roundIndex: number
  matchIndex: number
  title: string
  court: string
  scheduledAt: string
  a: MatchSlot
  b: MatchSlot
  winnerId?: string
  winnerTarget?: MatchTarget
  loserTarget?: MatchTarget
}

type StageMode = "single" | "multi"
type StageFormat =
  | "knockout"
  | "double_elimination"
  | "round_robin"
  | "swiss"
type TournamentStatus = "draft" | "ready" | "running" | "completed"

type TournamentStage = {
  id: string
  name: string
  format: StageFormat
  bracketSize: number
  roundsToPlay: number
  advanceCount: number
}

const sampleParticipants: Participant[] = [
  { id: "p-1", name: "Mika Santos", rating: 4.6, division: "Advanced" },
  { id: "p-2", name: "Ava Reyes", rating: 4.1, division: "Advanced" },
  { id: "p-3", name: "Noah Villareal", rating: 3.9, division: "Advanced" },
  { id: "p-4", name: "Jordan Alcaraz", rating: 3.7, division: "Advanced" },
  { id: "p-5", name: "Sofia Cruz", rating: 3.5, division: "Advanced" },
  { id: "p-6", name: "Leo Fontanilla", rating: 3.3, division: "Advanced" },
  { id: "p-7", name: "Ethan Bautista", rating: 3.1, division: "Advanced" },
  { id: "p-8", name: "Ria Mendoza", rating: 2.9, division: "Advanced" },
]

const fallbackCourts = ["Court 1", "Court 2", "Court 3", "Court 4"]

const stageFormatOptions: Array<{
  value: StageFormat
  label: string
  description: string
}> = [
  {
    value: "knockout",
    label: "Knockout bracket",
    description: "Single loss eliminates the player or team.",
  },
  {
    value: "double_elimination",
    label: "Double elimination",
    description: "Players move to a lower bracket after their first loss.",
  },
  {
    value: "round_robin",
    label: "Round-robin",
    description: "Everyone plays everyone, then rank by wins or points.",
  },
  {
    value: "swiss",
    label: "Swiss system",
    description: "Fixed rounds, pairing players with similar records.",
  },
]

const defaultStages: TournamentStage[] = [
  {
    id: "stage-qualifier",
    name: "Qualifier",
    format: "swiss",
    bracketSize: 8,
    roundsToPlay: 3,
    advanceCount: 4,
  },
  {
    id: "stage-playoffs",
    name: "Playoffs",
    format: "knockout",
    bracketSize: 4,
    roundsToPlay: 2,
    advanceCount: 1,
  },
]

function getFormatLabel(format: StageFormat) {
  return stageFormatOptions.find((option) => option.value === format)?.label ?? format
}

function getRoundTitle(roundIndex: number, totalRounds: number) {
  const remaining = totalRounds - roundIndex
  if (remaining === 1) return "Final"
  if (remaining === 2) return "Semifinal"
  if (remaining === 3) return "Quarterfinal"
  return `Round ${roundIndex + 1}`
}

function createParticipantSlot(participant: Participant, seed: number): MatchSlot {
  return {
    participantId: participant.id,
    name: participant.name,
    seed,
    rating: participant.rating,
  }
}

function createPlaceholderSlot(source: string): MatchSlot {
  return { name: "TBD", source }
}

function createByeSlot(): MatchSlot {
  return { name: "BYE" }
}

function getLoser(slotA: MatchSlot, slotB: MatchSlot, winner: MatchSlot) {
  if (slotA.participantId && slotA.participantId !== winner.participantId) {
    return slotA
  }
  if (slotB.participantId && slotB.participantId !== winner.participantId) {
    return slotB
  }
  return null
}

function getSlotHint(slot: MatchSlot) {
  if (!slot.source) return "Waiting for assignment"
  if (slot.source.startsWith("Winner of")) return "Winner from previous match"
  if (slot.source.startsWith("Loser of")) return "Loser from upper bracket"
  return slot.source
}

function getRoundLabel(
  format: StageFormat,
  round: TournamentMatch[],
  roundIndex: number,
  roundCount: number
) {
  if (format === "knockout") return getRoundTitle(roundIndex, roundCount)

  const firstTitle = round[0]?.title ?? ""
  if (format === "double_elimination") {
    if (firstTitle.startsWith("Upper ")) {
      return firstTitle.replace(/\s\d+$/, "")
    }
    if (firstTitle.startsWith("Lower consolidation")) {
      return `Lower consolidation ${firstTitle.split(" ")[2]?.split(".")[0] ?? ""}`.trim()
    }
    if (firstTitle.startsWith("Lower bracket")) {
      return `Lower bracket ${firstTitle.split(" ")[2]?.split(".")[0] ?? ""}`.trim()
    }
    if (firstTitle === "Grand final") return "Grand final"
  }

  return `Round ${roundIndex + 1}`
}

function getBracketLabel(match: TournamentMatch) {
  if (match.title === "Grand final") return "Grand final"
  if (match.title.startsWith("Upper ")) return "Upper bracket"
  if (match.title.startsWith("Lower ")) return "Lower bracket"
  return "Match"
}

function getMatchCardClass(match: TournamentMatch) {
  const bracketLabel = getBracketLabel(match)

  if (bracketLabel === "Grand final") {
    return "border-amber-300/80 bg-gradient-to-br from-amber-50 via-background to-emerald-50 shadow-md shadow-amber-900/5"
  }
  if (bracketLabel === "Upper bracket") {
    return "border-sky-200 bg-sky-50/45 shadow-sky-900/5"
  }
  if (bracketLabel === "Lower bracket") {
    return "border-orange-200 bg-orange-50/45 shadow-orange-900/5"
  }

  return "bg-background"
}

function getBracketBadgeClass(match: TournamentMatch) {
  const bracketLabel = getBracketLabel(match)

  if (bracketLabel === "Grand final") {
    return "bg-amber-500/15 text-amber-800 ring-1 ring-amber-300/70"
  }
  if (bracketLabel === "Upper bracket") return "bg-sky-500/10 text-sky-700"
  if (bracketLabel === "Lower bracket") return "bg-orange-500/10 text-orange-700"
  return "bg-muted text-muted-foreground"
}

function getSlotButtonClass(match: TournamentMatch, canWin: boolean, isWinner: boolean) {
  const bracketLabel = getBracketLabel(match)

  if (!canWin) return "cursor-not-allowed bg-muted/50 text-muted-foreground"
  if (isWinner && bracketLabel === "Grand final") {
    return "border-amber-400 bg-amber-100/80 text-amber-950"
  }
  if (isWinner && bracketLabel === "Upper bracket") {
    return "border-sky-400 bg-sky-100/80 text-sky-950"
  }
  if (isWinner && bracketLabel === "Lower bracket") {
    return "border-orange-400 bg-orange-100/80 text-orange-950"
  }
  if (bracketLabel === "Grand final") {
    return "bg-white/80 hover:border-amber-400 hover:bg-amber-50"
  }
  if (bracketLabel === "Upper bracket") {
    return "bg-white/75 hover:border-sky-400 hover:bg-sky-50"
  }
  if (bracketLabel === "Lower bracket") {
    return "bg-white/75 hover:border-orange-400 hover:bg-orange-50"
  }

  return "hover:border-primary/60 hover:bg-primary/5"
}

function isMatchPlayable(match: TournamentMatch) {
  const aReady = Boolean(match.a.participantId)
  const bReady = Boolean(match.b.participantId)
  const hasBye = match.a.name === "BYE" || match.b.name === "BYE"

  return (aReady && bReady) || (hasBye && (aReady || bReady))
}

function assignBracketTargets(rounds: TournamentMatch[][]) {
  const targetBySource = new Map<string, MatchTarget>()

  rounds.forEach((round, roundIndex) => {
    round.forEach((match, matchIndex) => {
      if (match.a.source) {
        targetBySource.set(match.a.source, {
          roundIndex,
          matchIndex,
          slot: "a",
        })
      }
      if (match.b.source) {
        targetBySource.set(match.b.source, {
          roundIndex,
          matchIndex,
          slot: "b",
        })
      }
    })
  })

  return rounds.map((round) =>
    round.map((match) => ({
      ...match,
      winnerTarget: targetBySource.get(`Winner of ${match.id}`),
      loserTarget: targetBySource.get(`Loser of ${match.id}`),
    }))
  )
}

function getCourt(courts: string[], index: number) {
  return courts[index % courts.length] ?? fallbackCourts[0]
}

function getSchedule(startTime: string, roundIndex: number, matchIndex: number) {
  return `${startTime} +${roundIndex * 90 + matchIndex * 30}m`
}

function getSeededSlots(participants: Participant[], bracketSize: number) {
  const sorted = [...participants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, bracketSize)

  return Array.from({ length: bracketSize }, (_, index) =>
    sorted[index] ? createParticipantSlot(sorted[index], index + 1) : createByeSlot()
  )
}

function generateKnockoutStage(
  participants: Participant[],
  stage: TournamentStage,
  courts: string[],
  startTime: string
) {
  const bracketSize = stage.bracketSize
  const seededSlots = getSeededSlots(participants, bracketSize)
  const totalRounds = Math.log2(bracketSize)
  const rounds: TournamentMatch[][] = []

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const matchCount = bracketSize / 2 ** (roundIndex + 1)
    const title = getRoundTitle(roundIndex, totalRounds)

    rounds.push(
      Array.from({ length: matchCount }, (_, matchIndex) => ({
        id: `${stage.id}-ko-r${roundIndex + 1}-m${matchIndex + 1}`,
        roundIndex,
        matchIndex,
        title: `${title} ${matchIndex + 1}`,
        court: getCourt(courts, matchIndex),
        scheduledAt: getSchedule(startTime, roundIndex, matchIndex),
        a:
          roundIndex === 0
            ? seededSlots[matchIndex]
            : createPlaceholderSlot(
                `Winner of ${stage.id}-ko-r${roundIndex}-m${matchIndex * 2 + 1}`
              ),
        b:
          roundIndex === 0
            ? seededSlots[bracketSize - 1 - matchIndex]
            : createPlaceholderSlot(
                `Winner of ${stage.id}-ko-r${roundIndex}-m${matchIndex * 2 + 2}`
              ),
      }))
    )
  }

  return advanceByes(assignBracketTargets(rounds))
}

function generateDoubleEliminationStage(
  participants: Participant[],
  stage: TournamentStage,
  courts: string[],
  startTime: string
) {
  const bracketSize = stage.bracketSize
  const seededSlots = getSeededSlots(participants, bracketSize)
  const totalUpperRounds = Math.log2(bracketSize)
  const winnerRounds: TournamentMatch[][] = []

  for (let roundIndex = 0; roundIndex < totalUpperRounds; roundIndex += 1) {
    const matchCount = bracketSize / 2 ** (roundIndex + 1)
    const title = getRoundTitle(roundIndex, totalUpperRounds)

    winnerRounds.push(
      Array.from({ length: matchCount }, (_, matchIndex) => ({
        id: `${stage.id}-de-ub-r${roundIndex + 1}-m${matchIndex + 1}`,
        roundIndex,
        matchIndex,
        title: `Upper ${title} ${matchIndex + 1}`,
        court: getCourt(courts, matchIndex),
        scheduledAt: getSchedule(startTime, roundIndex, matchIndex),
        a:
          roundIndex === 0
            ? seededSlots[matchIndex]
            : createPlaceholderSlot(
                `Winner of ${stage.id}-de-ub-r${roundIndex}-m${
                  matchIndex * 2 + 1
                }`
              ),
        b:
          roundIndex === 0
            ? seededSlots[bracketSize - 1 - matchIndex]
            : createPlaceholderSlot(
                `Winner of ${stage.id}-de-ub-r${roundIndex}-m${
                  matchIndex * 2 + 2
                }`
              ),
      }))
    )
  }

  const lowerRounds: TournamentMatch[][] = []
  const createLowerRound = (
    slots: Array<[MatchSlot, MatchSlot]>,
    titlePrefix = "Lower bracket"
  ) => {
    const lowerRoundIndex = lowerRounds.length
    const absoluteRoundIndex = winnerRounds.length + lowerRoundIndex
    lowerRounds.push(
      slots.map(([a, b], matchIndex) => ({
        id: `${stage.id}-de-lb-r${lowerRoundIndex + 1}-m${matchIndex + 1}`,
        roundIndex: absoluteRoundIndex,
        matchIndex,
        title: `${titlePrefix} ${lowerRoundIndex + 1}.${matchIndex + 1}`,
        court: getCourt(courts, matchIndex),
        scheduledAt: getSchedule(startTime, absoluteRoundIndex, matchIndex),
        a,
        b,
      }))
    )
  }

  const firstUpperRound = winnerRounds[0] ?? []
  const firstLowerSlots: Array<[MatchSlot, MatchSlot]> = []
  for (let index = 0; index < firstUpperRound.length; index += 2) {
    const firstMatch = firstUpperRound[index]
    const secondMatch = firstUpperRound[index + 1]
    if (!firstMatch || !secondMatch) continue
    firstLowerSlots.push([
      createPlaceholderSlot(`Loser of ${firstMatch.id}`),
      createPlaceholderSlot(`Loser of ${secondMatch.id}`),
    ])
  }
  if (firstLowerSlots.length > 0) createLowerRound(firstLowerSlots)

  for (
    let upperRoundIndex = 1;
    upperRoundIndex < winnerRounds.length;
    upperRoundIndex += 1
  ) {
    let previousLowerRound = lowerRounds.at(-1) ?? []
    const currentUpperRound = winnerRounds[upperRoundIndex] ?? []

    while (previousLowerRound.length > currentUpperRound.length) {
      const consolidationSlots: Array<[MatchSlot, MatchSlot]> = []
      for (let index = 0; index < previousLowerRound.length; index += 2) {
        const firstMatch = previousLowerRound[index]
        const secondMatch = previousLowerRound[index + 1]
        if (!firstMatch || !secondMatch) continue
        consolidationSlots.push([
          createPlaceholderSlot(`Winner of ${firstMatch.id}`),
          createPlaceholderSlot(`Winner of ${secondMatch.id}`),
        ])
      }
      createLowerRound(consolidationSlots, "Lower consolidation")
      previousLowerRound = lowerRounds.at(-1) ?? []
    }

    const dropSlots: Array<[MatchSlot, MatchSlot]> = currentUpperRound
      .map((upperMatch, matchIndex) => {
        const lowerMatch = previousLowerRound[matchIndex]
        if (!lowerMatch) return null
        return [
          createPlaceholderSlot(`Winner of ${lowerMatch.id}`),
          createPlaceholderSlot(`Loser of ${upperMatch.id}`),
        ] as [MatchSlot, MatchSlot]
      })
      .filter((item): item is [MatchSlot, MatchSlot] => Boolean(item))

    if (dropSlots.length > 0) createLowerRound(dropSlots)
  }

  const bracketRounds = [...winnerRounds, ...lowerRounds]
  const grandFinal: TournamentMatch[] = [
    {
      id: `${stage.id}-de-grand-final`,
      roundIndex: bracketRounds.length,
      matchIndex: 0,
      title: "Grand final",
      court: getCourt(courts, 0),
      scheduledAt: getSchedule(startTime, bracketRounds.length, 0),
      a: createPlaceholderSlot(
        `Winner of ${winnerRounds.at(-1)?.[0]?.id ?? "upper final"}`
      ),
      b: createPlaceholderSlot(
        `Winner of ${lowerRounds.at(-1)?.[0]?.id ?? "lower final"}`
      ),
    },
  ]

  return advanceByes(assignBracketTargets([...bracketRounds, grandFinal]))
}

function generateRoundRobinStage(
  participants: Participant[],
  stage: TournamentStage,
  courts: string[],
  startTime: string
) {
  const seeded = getSeededSlots(participants, stage.bracketSize).filter(
    (slot) => slot.participantId
  )
  const slots = seeded.length % 2 === 0 ? seeded : [...seeded, createByeSlot()]
  const rounds: TournamentMatch[][] = []
  const roundCount = Math.min(slots.length - 1, stage.roundsToPlay)
  let rotating = [...slots]

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const round: TournamentMatch[] = []

    for (let matchIndex = 0; matchIndex < rotating.length / 2; matchIndex += 1) {
      const a = rotating[matchIndex]
      const b = rotating[rotating.length - 1 - matchIndex]
      if (a.name === "BYE" || b.name === "BYE") continue

      round.push({
        id: `${stage.id}-rr-r${roundIndex + 1}-m${matchIndex + 1}`,
        roundIndex,
        matchIndex,
        title: `Round ${roundIndex + 1}.${matchIndex + 1}`,
        court: getCourt(courts, matchIndex),
        scheduledAt: getSchedule(startTime, roundIndex, matchIndex),
        a,
        b,
      })
    }

    rounds.push(round)
    rotating = [rotating[0], rotating.at(-1)!, ...rotating.slice(1, -1)]
  }

  return rounds
}

function generateSwissStage(
  participants: Participant[],
  stage: TournamentStage,
  courts: string[],
  startTime: string
) {
  const seeded = getSeededSlots(participants, stage.bracketSize).filter(
    (slot) => slot.participantId
  )
  const rounds: TournamentMatch[][] = []

  for (let roundIndex = 0; roundIndex < stage.roundsToPlay; roundIndex += 1) {
    const rotated = [
      ...seeded.slice(roundIndex),
      ...seeded.slice(0, roundIndex),
    ]
    const round: TournamentMatch[] = []

    for (let matchIndex = 0; matchIndex < rotated.length; matchIndex += 2) {
      const a = rotated[matchIndex]
      const b = rotated[matchIndex + 1] ?? createByeSlot()
      if (!a || b.name === "BYE") continue

      round.push({
        id: `${stage.id}-sw-r${roundIndex + 1}-m${matchIndex / 2 + 1}`,
        roundIndex,
        matchIndex: matchIndex / 2,
        title: `Swiss round ${roundIndex + 1}.${matchIndex / 2 + 1}`,
        court: getCourt(courts, matchIndex / 2),
        scheduledAt: getSchedule(startTime, roundIndex, matchIndex / 2),
        a,
        b,
      })
    }

    rounds.push(round)
  }

  return rounds
}

function generateStageMatches(
  participants: Participant[],
  stage: TournamentStage,
  courts: string[],
  startTime: string
) {
  if (stage.format === "double_elimination") {
    return generateDoubleEliminationStage(participants, stage, courts, startTime)
  }
  if (stage.format === "round_robin") {
    return generateRoundRobinStage(participants, stage, courts, startTime)
  }
  if (stage.format === "swiss") {
    return generateSwissStage(participants, stage, courts, startTime)
  }
  return generateKnockoutStage(participants, stage, courts, startTime)
}

function advanceByes(rounds: TournamentMatch[][]) {
  let nextRounds = rounds
  rounds[0]?.forEach((match) => {
    if (match.a.participantId && match.b.name === "BYE") {
      nextRounds = advanceWinner(nextRounds, match, match.a)
    } else if (match.b.participantId && match.a.name === "BYE") {
      nextRounds = advanceWinner(nextRounds, match, match.b)
    }
  })
  return nextRounds
}

function advanceWinner(
  rounds: TournamentMatch[][],
  match: TournamentMatch,
  winner: MatchSlot
) {
  const nextRounds = rounds.map((round) =>
    round.map((item) => ({
      ...item,
      a: { ...item.a },
      b: { ...item.b },
    }))
  )
  const currentMatch = nextRounds
    .flat()
    .find((item) => item.id === match.id)
  if (currentMatch) currentMatch.winnerId = winner.participantId

  const winnerSources = [`Winner of ${match.id}`, `Winner of ${match.title}`]
  const loserSources = [`Loser of ${match.id}`, `Loser of ${match.title}`]
  const loser = getLoser(match.a, match.b, winner)
  let routedWinner = placeSlotInTarget(
    nextRounds,
    currentMatch?.winnerTarget ?? match.winnerTarget,
    winner
  )
  let routedLoser = loser
    ? placeSlotInTarget(
        nextRounds,
        currentMatch?.loserTarget ?? match.loserTarget,
        loser
      )
    : false

  nextRounds.forEach((round) => {
    round.forEach((target) => {
      if (!routedWinner && target.a.source && winnerSources.includes(target.a.source)) {
        target.a = { ...winner, source: target.a.source }
        target.winnerId = undefined
        routedWinner = true
      }
      if (!routedWinner && target.b.source && winnerSources.includes(target.b.source)) {
        target.b = { ...winner, source: target.b.source }
        target.winnerId = undefined
        routedWinner = true
      }
      if (
        loser &&
        !routedLoser &&
        target.a.source &&
        loserSources.includes(target.a.source)
      ) {
        target.a = { ...loser, source: target.a.source }
        target.winnerId = undefined
        routedLoser = true
      }
      if (
        loser &&
        !routedLoser &&
        target.b.source &&
        loserSources.includes(target.b.source)
      ) {
        target.b = { ...loser, source: target.b.source }
        target.winnerId = undefined
        routedLoser = true
      }
    })
  })

  if (loser && !routedLoser) {
    const lowerRounds = nextRounds.filter((round) =>
      round.some((item) => item.title.startsWith("Lower"))
    )
    const lowerRound = lowerRounds[match.roundIndex] ?? lowerRounds[0]
    const lowerTarget =
      lowerRound?.[Math.floor(match.matchIndex / 2)] ?? lowerRound?.[0]

    if (lowerTarget) {
      const targetSide = match.matchIndex % 2 === 0 ? "a" : "b"
      const fallbackSlot = lowerTarget[targetSide]
      if (
        fallbackSlot.name === "TBD" &&
        (fallbackSlot.source?.startsWith("Loser") ||
          fallbackSlot.source === "Loser from upper bracket")
      ) {
        lowerTarget[targetSide] = { ...loser, source: fallbackSlot.source }
        lowerTarget.winnerId = undefined
        routedLoser = true
      }
    }

    if (!routedLoser) {
      const fallbackTarget = lowerRounds
        .flat()
        .find(
          (item) =>
            item.a.name === "TBD" &&
            (item.a.source?.startsWith("Loser") ||
              item.a.source === "Loser from upper bracket")
        )
      if (fallbackTarget) {
        fallbackTarget.a = { ...loser, source: fallbackTarget.a.source }
        fallbackTarget.winnerId = undefined
      }
    }
  }

  if (!routedWinner) {
    const nextRoundIndex = match.roundIndex + 1
    const nextMatchIndex = Math.floor(match.matchIndex / 2)
    const target = nextRounds[nextRoundIndex]?.[nextMatchIndex]
    const targetSide = match.matchIndex % 2 === 0 ? "a" : "b"
    const targetSlot = target?.[targetSide]

    if (
      target &&
      targetSlot &&
      targetSlot.name === "TBD" &&
      targetSlot.source?.startsWith("Winner of")
    ) {
      target[targetSide] = { ...winner, source: targetSlot.source }
      target.winnerId = undefined
    }
  }

  return nextRounds
}

function placeSlotInTarget(
  rounds: TournamentMatch[][],
  target: MatchTarget | undefined,
  slot: MatchSlot
) {
  if (!target) return false

  const targetMatch = rounds[target.roundIndex]?.[target.matchIndex]
  const targetSlot = targetMatch?.[target.slot]
  if (!targetMatch || !targetSlot) return false

  targetMatch[target.slot] = { ...slot, source: targetSlot.source }
  targetMatch.winnerId = undefined
  return true
}

function getChampion(rounds: TournamentMatch[][]) {
  const final = rounds.at(-1)?.[0]
  if (!final?.winnerId) return null
  return [final.a, final.b].find((slot) => slot.participantId === final.winnerId)
}

function groupMatchesByRound(
  matches: OwnerTournamentMatchApiItem[],
  stageId: string
) {
  const grouped = matches
    .filter((match) => match.stage_id === stageId)
    .reduce<Record<number, TournamentMatch[]>>((current, match) => {
      current[match.round_index] = current[match.round_index] ?? []
      current[match.round_index].push({
        id: match.id,
        roundIndex: match.round_index,
        matchIndex: match.match_index,
        title: match.title,
        court: match.court,
        scheduledAt: match.scheduled_at,
        a: {
          participantId: match.a.participant_id ?? undefined,
          name: match.a.name,
          seed: match.a.seed ?? undefined,
          rating: match.a.rating ?? undefined,
          source: match.a.source ?? undefined,
        },
        b: {
          participantId: match.b.participant_id ?? undefined,
          name: match.b.name,
          seed: match.b.seed ?? undefined,
          rating: match.b.rating ?? undefined,
          source: match.b.source ?? undefined,
        },
        winnerId: match.winner_participant_id ?? undefined,
      })
      return current
    }, {})

  const rounds = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)
    .map((roundIndex) =>
      grouped[roundIndex].sort((a, b) => a.matchIndex - b.matchIndex)
    )

  return assignBracketTargets(rounds)
}

export function OwnerTournamentsPage() {
  const { owner } = useOwnerAuth()
  const toast = useToast()
  const [tournamentPublicId, setTournamentPublicId] = useState<string | null>(null)
  const [name, setName] = useState("September Ladder Cup")
  const [division, setDivision] = useState("Mixed Doubles")
  const [eventDate, setEventDate] = useState("2026-09-20")
  const [startTime, setStartTime] = useState("9:00 AM")
  const [stageMode, setStageMode] = useState<StageMode>("single")
  const [singleStage, setSingleStage] = useState<TournamentStage>({
    id: "stage-main",
    name: "Main stage",
    format: "knockout",
    bracketSize: 8,
    roundsToPlay: 3,
    advanceCount: 1,
  })
  const [multiStages, setMultiStages] =
    useState<TournamentStage[]>(defaultStages)
  const [activeStageId, setActiveStageId] = useState(defaultStages[0].id)
  const [participants, setParticipants] =
    useState<Participant[]>(sampleParticipants)
  const [playerName, setPlayerName] = useState("")
  const [playerRating, setPlayerRating] = useState("3.0")
  const [courts, setCourts] = useState<string[]>(fallbackCourts)
  const [rounds, setRounds] = useState<TournamentMatch[][]>(() =>
    generateStageMatches(sampleParticipants, singleStage, fallbackCourts, "9:00 AM")
  )
  const [status, setStatus] = useState<TournamentStatus>("ready")
  const [isSaving, setIsSaving] = useState(false)
  const [savedTournaments, setSavedTournaments] = useState<
    OwnerTournamentApiItem[]
  >([])

  const activeStage =
    stageMode === "single"
      ? singleStage
      : (multiStages.find((stage) => stage.id === activeStageId) ?? multiStages[0])

  useEffect(() => {
    if (!owner?.token) return

    let isActive = true
    void getOwnerVenuesWithApi(owner.token)
      .then((venues) => {
        if (!isActive) return
        const nextCourts = venues.flatMap((venue) =>
          venue.courts
            .filter((court) => court.status === "available")
            .map((court) => `${venue.name} / ${court.name}`)
        )
        setCourts(nextCourts.length > 0 ? nextCourts : fallbackCourts)
      })
      .catch(() => {
        if (isActive) setCourts(fallbackCourts)
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  useEffect(() => {
    if (!owner?.token) return

    let isActive = true
    void loadSavedTournaments()
      .catch(() => {
        if (!isActive) return
        toast.add({
          title: "Unable to load tournaments",
          description: "The tournament editor remains available while we retry the connection.",
          type: "error",
        })
      })

    async function loadSavedTournaments() {
      if (!owner?.token) return
      const response = await getOwnerTournamentsWithApi(owner.token)
      if (!isActive) return
      setSavedTournaments(response.items)
      if (response.items.length > 0) hydrateTournament(response.items[0])
    }

    return () => {
      isActive = false
    }
  }, [owner?.token])

  const rankedParticipants = useMemo(
    () => [...participants].sort((a, b) => b.rating - a.rating),
    [participants]
  )
  const champion = getChampion(rounds)
  const flatMatches = rounds.flat()
  const totalMatches = flatMatches.length
  const completedMatches = flatMatches.filter((match) => match.winnerId).length
  const readyMatches = flatMatches.filter(
    (match) => match.a.participantId && match.b.participantId
  ).length

  function updateActiveStage(patch: Partial<TournamentStage>) {
    setStatus("draft")
    if (stageMode === "single") {
      setSingleStage((current) => ({ ...current, ...patch }))
      return
    }

    setMultiStages((current) =>
      current.map((stage) =>
        stage.id === activeStage.id ? { ...stage, ...patch } : stage
      )
    )
  }

  function handleAddParticipant() {
    const cleanedName = playerName.trim()
    const rating = Number(playerRating)
    if (!cleanedName || !Number.isFinite(rating)) return

    setParticipants((current) => [
      ...current,
      {
        id: `p-${Date.now()}`,
        name: cleanedName,
        rating: Math.max(1, Math.min(5, rating)),
        division: "Manual",
      },
    ])
    setPlayerName("")
    setPlayerRating("3.0")
    setStatus("draft")
  }

  function handleNewTournament() {
    const nextSingleStage: TournamentStage = {
      id: "stage-main",
      name: "Main stage",
      format: "knockout",
      bracketSize: 8,
      roundsToPlay: 3,
      advanceCount: 1,
    }

    setTournamentPublicId(null)
    setName("New Tournament")
    setDivision("Mixed Doubles")
    setEventDate("")
    setStartTime("9:00 AM")
    setStageMode("single")
    setSingleStage(nextSingleStage)
    setMultiStages(defaultStages)
    setActiveStageId(defaultStages[0].id)
    setParticipants(sampleParticipants)
    setRounds(generateStageMatches(sampleParticipants, nextSingleStage, courts, "9:00 AM"))
    setStatus("draft")
  }

  function hydrateTournament(tournament: OwnerTournamentApiItem) {
    const stages = tournament.stages
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        format: stage.format,
        bracketSize: stage.bracket_size,
        roundsToPlay: stage.rounds_to_play,
        advanceCount: stage.advance_count,
      }))
      .sort((a, b) => {
        const aSource = tournament.stages.find((stage) => stage.id === a.id)
        const bSource = tournament.stages.find((stage) => stage.id === b.id)
        return (aSource?.sort_order ?? 0) - (bSource?.sort_order ?? 0)
      })
    const firstStage = stages[0] ?? singleStage

    setTournamentPublicId(tournament.public_id)
    setName(tournament.name)
    setDivision(tournament.division)
    setEventDate(tournament.event_date ?? "")
    setStartTime(tournament.start_time)
    setStageMode(tournament.stage_mode)
    setStatus(tournament.status)
    setParticipants(
      tournament.participants
        .map((participant) => ({
          id: participant.id,
          name: participant.name,
          rating: participant.rating,
          division: participant.division,
        }))
        .sort((a, b) => b.rating - a.rating)
    )

    if (tournament.stage_mode === "single") {
      setSingleStage(firstStage)
    } else {
      setMultiStages(stages.length > 0 ? stages : defaultStages)
      setActiveStageId(firstStage.id)
    }

    const savedRounds = groupMatchesByRound(tournament.matches, firstStage.id)
    setRounds(
      savedRounds.length > 0
        ? savedRounds
        : generateStageMatches(
            tournament.participants.map((participant) => ({
              id: participant.id,
              name: participant.name,
              rating: participant.rating,
              division: participant.division,
            })),
            firstStage,
            courts,
            tournament.start_time
          )
    )
  }

  function buildSavePayload(): OwnerTournamentSaveInput {
    const stages = stageMode === "single" ? [singleStage] : multiStages
    const rankedIds = new Map(
      rankedParticipants.map((participant, index) => [participant.id, index])
    )

    return {
      public_id: tournamentPublicId,
      name,
      division,
      event_date: eventDate || null,
      start_time: startTime,
      stage_mode: stageMode,
      status,
      stages: stages.map((stage, index) => ({
        id: stage.id,
        name: stage.name,
        format: stage.format,
        bracket_size: stage.bracketSize,
        rounds_to_play: stage.roundsToPlay,
        advance_count: stage.advanceCount,
        sort_order: index,
      })),
      participants: participants.map((participant) => ({
        id: participant.id,
        name: participant.name,
        rating: participant.rating,
        division: participant.division,
        seed_order: rankedIds.get(participant.id) ?? 0,
      })),
      matches: rounds.flat().map((match) => ({
        id: match.id,
        stage_id: activeStage.id,
        round_index: match.roundIndex,
        match_index: match.matchIndex,
        title: match.title,
        court: match.court,
        scheduled_at: match.scheduledAt,
        a: {
          participant_id: match.a.participantId ?? null,
          name: match.a.name,
          seed: match.a.seed ?? null,
          rating: match.a.rating ?? null,
          source: match.a.source ?? null,
        },
        b: {
          participant_id: match.b.participantId ?? null,
          name: match.b.name,
          seed: match.b.seed ?? null,
          rating: match.b.rating ?? null,
          source: match.b.source ?? null,
        },
        winner_participant_id: match.winnerId ?? null,
        notes: null,
      })),
    }
  }

  async function handleSaveTournament() {
    if (!owner?.token) return

    setIsSaving(true)
    try {
      const saved = await saveOwnerTournamentWithApi(
        owner.token,
        buildSavePayload()
      )
      setTournamentPublicId(saved.public_id)
      setSavedTournaments((current) => {
        const next = [
          saved,
          ...current.filter((item) => item.public_id !== saved.public_id),
        ]
        return next.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      })
      toast.add({
        title: "Tournament saved",
        description: `${saved.name} has been saved.`,
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Unable to save tournament",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleGenerateStage() {
    setRounds(generateStageMatches(rankedParticipants, activeStage, courts, startTime))
    setStatus("ready")
  }

  function handleShuffleSeeds() {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    setParticipants(shuffled)
    setRounds(generateStageMatches(shuffled, activeStage, courts, startTime))
    setStatus("ready")
  }

  function handleWinner(match: TournamentMatch, slot: MatchSlot) {
    if (!slot.participantId) return
    const nextRounds = advanceWinner(rounds, match, slot)
    setRounds(nextRounds)
    setStatus(getChampion(nextRounds) ? "completed" : "running")
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Tournament manager</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Matchmaking and stages
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Build a single-stage event or combine multiple stages such as Swiss
            qualifiers into a knockout playoff.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleShuffleSeeds}>
            <Shuffle className="size-4" aria-hidden="true" />
            Shuffle
          </Button>
          <Button type="button" onClick={handleGenerateStage}>
            <Swords className="size-4" aria-hidden="true" />
            Generate stage
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={handleSaveTournament}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Save
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Players",
            value: participants.length,
            detail: `${Math.min(participants.length, activeStage.bracketSize)}/${activeStage.bracketSize} stage slots`,
            icon: UsersRound,
            tone: "bg-sky-500/10 text-sky-700",
          },
          {
            label: "Stage format",
            value: getFormatLabel(activeStage.format),
            detail: stageMode === "single" ? "Single stage" : `${multiStages.length} stages`,
            icon: Layers3,
            tone: "bg-emerald-500/10 text-emerald-700",
          },
          {
            label: "Completed",
            value: completedMatches,
            detail: `${totalMatches} matches generated`,
            icon: CheckCircle2,
            tone: "bg-violet-500/10 text-violet-700",
          },
          {
            label: "Leader",
            value: champion?.name ?? "TBD",
            detail:
              activeStage.format === "knockout"
                ? "Final winner appears here"
                : "Use wins/points for standings",
            icon: Trophy,
            tone: "bg-amber-500/10 text-amber-700",
          },
        ].map((metric) => (
          <Card key={metric.label} className="rounded-lg">
            <CardContent className="flex items-center gap-3 p-4">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md",
                  metric.tone
                )}
              >
                <metric.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-muted-foreground">
                  {metric.label}
                </span>
                <span className="block truncate text-lg font-semibold">
                  {metric.value}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {metric.detail}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Card className="rounded-lg">
            <CardContent className="grid gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Saved tournaments</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Open an existing event or start a fresh one.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleNewTournament}>
                  <Plus className="size-4" aria-hidden="true" />
                  New
                </Button>
              </div>

              {savedTournaments.length === 0 ? (
                <div className="rounded-md border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                  No saved tournaments yet. Configure one, generate matches, then
                  press Save.
                </div>
              ) : (
                <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
                  {savedTournaments.map((tournament) => {
                    const selected = tournament.public_id === tournamentPublicId
                    const stageCount = tournament.stages.length
                    const firstStage = tournament.stages[0]

                    return (
                      <button
                        key={tournament.public_id}
                        type="button"
                        onClick={() => hydrateTournament(tournament)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left transition",
                          selected
                            ? "border-primary bg-primary/10"
                            : "bg-background hover:border-primary/50"
                        )}
                      >
                        <span className="block truncate text-sm font-medium">
                          {tournament.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {tournament.event_date ?? "No date"} /{" "}
                          {tournament.stage_mode === "single"
                            ? getFormatLabel(firstStage?.format ?? "knockout")
                            : `${stageCount} stages`}
                        </span>
                        <span className="mt-1 inline-flex rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                          {tournament.status}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardContent className="grid gap-4 p-4">
              <div>
                <p className="text-sm font-semibold">Tournament setup</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configure the event, stage mode, and active stage format.
                </p>
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Tournament name</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Division</span>
                <Input
                  value={division}
                  onChange={(event) => setDivision(event.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Date</span>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Start</span>
                  <Input
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-1">
                {[
                  { value: "single", label: "Single stage" },
                  { value: "multi", label: "Multi-stage" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStageMode(option.value as StageMode)
                      setStatus("draft")
                    }}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition",
                      stageMode === option.value
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {stageMode === "multi" ? (
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Stages</span>
                  {multiStages.map((stage, index) => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActiveStageId(stage.id)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-left transition",
                        activeStage.id === stage.id
                          ? "border-primary bg-primary/10"
                          : "bg-background hover:border-primary/50"
                      )}
                    >
                      <span className="block text-sm font-medium">
                        {index + 1}. {stage.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {getFormatLabel(stage.format)} / top {stage.advanceCount} advance
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Active stage name</span>
                <Input
                  value={activeStage.name}
                  onChange={(event) => updateActiveStage({ name: event.target.value })}
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Stage format</span>
                <select
                  value={activeStage.format}
                  onChange={(event) =>
                    updateActiveStage({ format: event.target.value as StageFormat })
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  {stageFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">
                  {
                    stageFormatOptions.find(
                      (option) => option.value === activeStage.format
                    )?.description
                  }
                </span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Size</span>
                  <select
                    value={activeStage.bracketSize}
                    onChange={(event) =>
                      updateActiveStage({ bracketSize: Number(event.target.value) })
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Rounds</span>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={activeStage.roundsToPlay}
                    onChange={(event) =>
                      updateActiveStage({
                        roundsToPlay: Math.max(1, Number(event.target.value)),
                      })
                    }
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Advance</span>
                  <Input
                    type="number"
                    min="1"
                    value={activeStage.advanceCount}
                    onChange={(event) =>
                      updateActiveStage({
                        advanceCount: Math.max(1, Number(event.target.value)),
                      })
                    }
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardContent className="grid gap-4 p-4">
              <div>
                <p className="text-sm font-semibold">Add player</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ratings are used to seed matchmaking.
                </p>
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Player name</span>
                <Input
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  placeholder="Player full name"
                />
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Rating</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={playerRating}
                    onChange={(event) => setPlayerRating(event.target.value)}
                  />
                </label>
                <Button
                  type="button"
                  className="self-end"
                  onClick={handleAddParticipant}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardContent className="grid gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Seed list</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Top ratings are seeded first.
                  </p>
                </div>
                <Medal className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
                {rankedParticipants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {participant.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {participant.division}
                      </span>
                    </span>
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {participant.rating.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg">
          <CardContent className="grid gap-4 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold">
                  {name} / {activeStage.name}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {eventDate} at {startTime}
                  </span>
                  <span>{division}</span>
                  <span>{getFormatLabel(activeStage.format)}</span>
                  <span className="capitalize">{status}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeStage.format === "knockout" ||
                  activeStage.format === "double_elimination"
                    ? "Selecting a winner advances that player through the bracket. In double elimination, the loser drops into a lower-bracket match."
                    : "Selecting a winner records the result for this format; standings and next-round pairing are handled separately."}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <ListPlus className="size-4" aria-hidden="true" />
                {readyMatches} playable / {courts.length} courts
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              {rounds.map((round, roundIndex) => (
                <div key={`round-${roundIndex}`} className="grid content-start gap-3">
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <p className="text-sm font-semibold">
                      {getRoundLabel(
                        activeStage.format,
                        round,
                        roundIndex,
                        rounds.length
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {round.length} match{round.length === 1 ? "" : "es"}
                    </p>
                  </div>
                  {round.map((match) => {
                    const bracketLabel = getBracketLabel(match)
                    const isGrandFinal = bracketLabel === "Grand final"

                    return (
                      <div
                        key={match.id}
                        className={cn(
                          "relative overflow-hidden rounded-lg border p-3 shadow-xs",
                          getMatchCardClass(match)
                        )}
                      >
                        {isGrandFinal ? (
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-amber-400" />
                        ) : null}
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {isGrandFinal ? (
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-800">
                                  <Trophy className="size-4" aria-hidden="true" />
                                </span>
                              ) : null}
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  isGrandFinal && "text-base text-amber-950"
                                )}
                              >
                                {match.title}
                              </p>
                              {activeStage.format === "double_elimination" ? (
                                <span
                                  className={cn(
                                    "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                                    getBracketBadgeClass(match)
                                  )}
                                >
                                  {bracketLabel}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {match.court} / {match.scheduledAt}
                            </p>
                            {!match.winnerId && !isMatchPlayable(match) ? (
                              <p className="mt-1 text-xs font-medium text-amber-700">
                                Waiting for opponent
                              </p>
                            ) : null}
                          </div>
                          {match.winnerId ? (
                            <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700">
                              Done
                            </span>
                          ) : null}
                        </div>
                        {[match.a, match.b].map((slot, index) => {
                          const isWinner = slot.participantId === match.winnerId
                          const canWin =
                            Boolean(slot.participantId) && isMatchPlayable(match)

                          return (
                            <button
                              key={`${match.id}-${index}`}
                              type="button"
                              disabled={!canWin}
                              onClick={() => handleWinner(match, slot)}
                              className={cn(
                                "mb-2 flex min-h-12 w-full items-center gap-2 rounded-md border px-3 py-2 text-left transition last:mb-0",
                                getSlotButtonClass(match, canWin, isWinner)
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                                  isGrandFinal
                                    ? "bg-amber-500/15 text-amber-900"
                                    : "bg-muted"
                                )}
                              >
                                {slot.seed ?? "-"}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                  {slot.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {slot.rating
                                    ? `Rating ${slot.rating.toFixed(1)}`
                                    : getSlotHint(slot)}
                                </span>
                              </span>
                              {isWinner ? (
                                <CheckCircle2
                                  className="size-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                />
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
