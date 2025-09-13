"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  Search,
  Leaf,
  Vegan,
  WheatOff,
  ChevronDown,
  ChevronUp,
  Bot,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  suggestMealsFromInput,
  SuggestMealsOutput,
} from "@/ai/flows/suggest-meals-from-input";
import {
  searchDishesByImage,
  SearchDishesByImageOutput,
} from "@/ai/flows/search-dishes-by-image";
import {
  personalizeRecipe,
  PersonalizeRecipeOutput,
} from "@/ai/flows/personalize-recipe";
import {
  chatWithAssistant,
  ChatWithAssistantOutput,
} from "@/ai/flows/chat-with-assistant";
import { recipes } from "@/lib/recipes";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Recipe = {
  name: string;
  recipe: string;
  source: string;
  description: string;
};
type DishSearchResult = SearchDishesByImageOutput;
type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export default function MealSuggester() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Shared state
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);

  // Text suggestion state
  const [userInput, setUserInput] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestMealsOutput | null>(
    null
  );
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Image search state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dishSearchResult, setDishSearchResult] =
    useState<DishSearchResult | null>(null);

  // Personalization state
  const [personalizedRecipe, setPersonalizedRecipe] =
    useState<PersonalizeRecipeOutput | null>(null);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleDietaryChange = (preference: string) => {
    setDietaryPrefs((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestMeals = async () => {
    if (!userInput.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please tell us what you're craving.",
      });
      return;
    }
    clearResults();
    startTransition(async () => {
      try {
        const result = await suggestMealsFromInput({ userInput });
        setSuggestions(result);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not get suggestions. Please try again.",
        });
      }
    });
  };

  const handleSearchByImage = () => {
    if (!imagePreview) {
      toast({
        variant: "destructive",
        title: "Image required",
        description: "Please upload an image to search.",
      });
      return;
    }
    clearResults();
    startTransition(async () => {
      try {
        const result = await searchDishesByImage({
          photoDataUri: imagePreview,
        });
        setDishSearchResult(result);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not identify the dish. Please try another image.",
        });
      }
    });
  };

  const handleSelectSuggestedDish = (dishName: string) => {
    const recipeData = recipes[dishName as keyof typeof recipes];
    if (recipeData) {
      setSelectedRecipe(recipeData);
      setPersonalizedRecipe(null);
    } else {
      toast({
        title: "Recipe not found",
        description: `We don't have a sample recipe for ${dishName} just yet.`,
      });
    }
  };

  const handlePersonalize = () => {
    if (!selectedRecipe || dietaryPrefs.length === 0) return;
    setIsPersonalizing(true);
    startTransition(async () => {
      try {
        const result = await personalizeRecipe({
          recipe: selectedRecipe.recipe,
          dietaryRestrictions: dietaryPrefs.join(", "),
        });
        setPersonalizedRecipe(result);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Personalization Error",
          description: "Could not personalize the recipe.",
        });
      } finally {
        setIsPersonalizing(false);
      }
    });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, newMessage]);
    setChatInput("");
    setIsChatting(true);

    const genkitHistory = chatHistory.map(msg => ({
      [msg.role]: msg.content
    }));

    startTransition(async () => {
      try {
        const result = await chatWithAssistant({ history: genkitHistory, message: chatInput });
        const aiMessage: ChatMessage = {
          role: "model",
          content: result.response,
        };
        setChatHistory((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Chat Error",
          description: "Could not get a response from the assistant.",
        });
        const errorMessage: ChatMessage = {
          role: "model",
          content: "Sorry, I'm having trouble connecting right now.",
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsChatting(false);
      }
    });
  };

  const clearResults = () => {
    setSuggestions(null);
    setSelectedRecipe(null);
    setDishSearchResult(null);
    setPersonalizedRecipe(null);
  };
  
  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian", icon: Leaf },
    { id: "vegan", label: "Vegan", icon: Vegan },
    { id: "gluten-free", label: "Gluten-Free", icon: WheatOff },
  ];

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-4 md:p-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="chat">
              <Bot className="mr-2 h-4 w-4" /> AI Assistant
            </TabsTrigger>
            <TabsTrigger value="suggest">
              <Sparkles className="mr-2 h-4 w-4" /> Suggest
            </TabsTrigger>
            <TabsTrigger value="image">
              <Upload className="mr-2 h-4 w-4" /> Image Search
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-6">
            <div className="flex flex-col h-[400px]">
              <ScrollArea className="flex-grow p-4 border rounded-t-lg bg-muted/20" ref={chatContainerRef}>
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        message.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {message.role === "model" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Bot />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-card-foreground border"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex items-start gap-3">
                       <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Bot />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-background p-3 rounded-lg">
                            <Spinner className="h-5 w-5" />
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 p-4 border-t">
                <Input
                  placeholder="Ask about Nigerian food..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isChatting}
                />
                <Button onClick={handleSendMessage} disabled={isChatting}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggest" className="mt-6">
            <div className="flex flex-col gap-4">
              <Label htmlFor="craving-input" className="text-base font-medium">
                What are you in the mood for?
              </Label>
              <div className="flex gap-2">
                <Input
                  id="craving-input"
                  placeholder="e.g., 'something spicy with chicken' or 'what can I make with yams?'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isPending}
                />
                <Button onClick={handleSuggestMeals} disabled={isPending}>
                  {isPending ? <Spinner /> : <Sparkles className="mr-2" />}
                  Suggest
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-6">
            <div className="flex flex-col gap-4 items-center">
              <Label htmlFor="image-upload" className="w-full text-base font-medium text-center">
                Upload a photo of a dish
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isPending}
              />
              <Button asChild variant="outline" className="cursor-pointer">
                <Label htmlFor="image-upload">
                  <Upload className="mr-2" />
                  Choose File
                </Label>
              </Button>
              {imagePreview && (
                <div className="mt-4 p-2 border-2 border-dashed rounded-lg">
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    width={200}
                    height={200}
                    className="object-contain rounded-md"
                  />
                </div>
              )}
              {imageFile && (
                <Button onClick={handleSearchByImage} disabled={isPending} className="mt-4">
                  {isPending ? <Spinner /> : <Search className="mr-2" />}
                  Identify Dish
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div>
          <h3 className="text-base font-medium mb-3">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-4 items-center">
            {dietaryOptions.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox
                  id={opt.id}
                  onCheckedChange={() => handleDietaryChange(opt.id)}
                  checked={dietaryPrefs.includes(opt.id)}
                />
                <Label htmlFor={opt.id} className="flex items-center gap-2 font-normal cursor-pointer">
                  <opt.icon className="h-4 w-4 text-accent" />
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {isPending && !suggestions && !dishSearchResult && (
            <div className="text-center p-8 flex flex-col items-center gap-4">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-muted-foreground">Our AI chef is thinking...</p>
            </div>
        )}

        <div className="mt-8 space-y-6">
          {suggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Meal Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {suggestions.suggestions.map((name) => (
                  <Button
                    key={name}
                    variant="secondary"
                    onClick={() => handleSelectSuggestedDish(name)}
                  >
                    {name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {dishSearchResult && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{dishSearchResult.dishName}</CardTitle>
                <CardDescription>{dishSearchResult.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src={dishSearchResult.imageUrl}
                  alt={dishSearchResult.dishName}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-video"
                />
              </CardContent>
              <CardFooter>
                 <p className="text-sm text-muted-foreground">Recipe Source: {dishSearchResult.recipeSource}</p>
              </CardFooter>
            </Card>
          )}

          {selectedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{selectedRecipe.name}</CardTitle>
                <CardDescription>{selectedRecipe.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="font-body text-sm whitespace-pre-wrap p-4 bg-muted/50 rounded-md overflow-x-auto">
                  {selectedRecipe.recipe}
                </pre>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <p className="text-sm text-muted-foreground">Source: {selectedRecipe.source}</p>
                    {dietaryPrefs.length > 0 && (
                        <Button onClick={handlePersonalize} disabled={isPersonalizing}>
                            {(isPersonalizing || isPending) ? <Spinner /> : <Sparkles className="mr-2" />}
                            Personalize for {dietaryPrefs.join(", ")}
                        </Button>
                    )}
                </div>
              </CardContent>

              {personalizedRecipe && (
                 <CardFooter className="flex-col items-start gap-4">
                     <Separator />
                     <Collapsible className="w-full">
                         <CollapsibleTrigger asChild>
                             <Button variant="ghost" className="flex justify-between w-full px-2">
                                <h3 className="font-headline text-lg text-primary">View Personalized Recipe</h3>
                                <ChevronDown className="h-4 w-4" />
                             </Button>
                         </CollapsibleTrigger>
                         <CollapsibleContent>
                            <pre className="font-body text-sm whitespace-pre-wrap mt-4 p-4 bg-primary/10 rounded-md">
                                {personalizedRecipe.personalizedRecipe}
                            </pre>
                         </CollapsibleContent>
                     </Collapsible>
                 </CardFooter>
              )}
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
