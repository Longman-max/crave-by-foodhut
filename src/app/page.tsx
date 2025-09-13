import Header from "@/components/header";
import Footer from "@/components/footer";
import PopularDishes from "@/components/popular-dishes";
import MealSuggester from "@/components/meal-suggester";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <section className="text-center mb-12 md:mb-16">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Discover the Taste of Nigeria
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From savory Jollof to spicy Suya, find your next craving or let our AI chef inspire you.
          </p>
        </section>

        <MealSuggester />

        <PopularDishes />
      </main>
      <Footer />
    </div>
  );
}
