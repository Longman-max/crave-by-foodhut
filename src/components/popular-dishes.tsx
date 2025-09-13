import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";

const PopularDishes = () => {
  const dishes = PlaceHolderImages;

  return (
    <section className="mt-16 md:mt-24">
      <div className="relative mb-8 md:mb-12">
        <Separator />
        <h2 className="absolute left-1/2 -translate-x-1/2 -top-4 bg-background px-4 font-headline text-2xl md:text-3xl font-semibold">
          Popular Dishes
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {dishes.map((dish) => (
          <Card key={dish.id} className="overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl">
            <CardHeader className="p-0">
              <div className="aspect-video relative">
                <Image
                  src={dish.imageUrl}
                  alt={dish.description}
                  fill
                  className="object-cover"
                  data-ai-hint={dish.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="font-headline text-xl">
                {dish.description}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PopularDishes;
