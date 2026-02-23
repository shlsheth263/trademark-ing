export function Footer() {
  return (
    <footer className="border-t bg-secondary py-6">
      <div className="container text-center text-xs text-muted-foreground">
        <p className="mb-1 font-medium">AI Trademark Similarity &amp; Application Portal</p>
        <p>© {new Date().getFullYear()} Intellectual Property Office. All rights reserved.</p>
        <p className="mt-2">
          This portal provides AI-assisted trademark similarity analysis for advisory purposes only.
          Final determination is subject to formal evaluation by the Trademark Authority.
        </p>
      </div>
    </footer>
  );
}
