const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t bg-card">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Crave by FoodHut. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
