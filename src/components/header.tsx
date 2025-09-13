import { UtensilsCrossed } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const Header = () => {
  return (
    <header className="py-4 px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <UtensilsCrossed className="h-7 w-7 text-primary" />
          <span className="ml-3 font-headline text-2xl font-bold tracking-wide">
            Crave by FoodHut
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
