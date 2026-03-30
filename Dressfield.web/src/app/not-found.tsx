import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-4">
      <p className="text-8xl font-semibold text-black/10">404</p>
      <h1 className="font-ui text-4xl font-semibold -mt-2">გვერდი ვერ მოიძებნა</h1>
      <p className="text-muted-foreground max-w-sm">
        მოთხოვნილი გვერდი არ არსებობს ან წაიშალა.
      </p>
      <Link href="/">
        <Button className="bg-accent text-white hover:bg-accent-hover">
          მთავარ გვერდზე დაბრუნება
        </Button>
      </Link>
    </div>
  );
}
