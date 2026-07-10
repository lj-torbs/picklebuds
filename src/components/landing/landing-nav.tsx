import {
  CalendarCheck,
  LogIn,
  Menu,
  UserPlus,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-bold tracking-tight text-lg">
              PickleBuddy
            </p>
            <p className="text-xs text-muted-foreground">
              Smart Court Reservation
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right side: desktop buttons + mobile menu grouped together */}
        <div className="flex items-center gap-3">
          {/* Desktop Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </a>
            <a href="/signup">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Button>
            </a>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-8 flex flex-col gap-5">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
                <hr className="my-2" />
                <a href="/login" className={buttonVariants({ variant: "outline" })}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </a>
                <a href="/signup" className={buttonVariants({})}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
