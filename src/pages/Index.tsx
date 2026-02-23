import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, FileText, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            AI Trademark Similarity &amp; Application Portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use this portal to check your trademark logo against existing registered marks using
            AI-powered similarity analysis, and submit your trademark application online.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-accent text-accent-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Check Trademark Similarity</CardTitle>
                  <CardDescription>
                    Upload your logo and check against registered trademarks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/check-similarity">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-accent text-accent-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Track Application</CardTitle>
                  <CardDescription>
                    Check the status of your submitted trademark application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/track">
                  Track Now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Accordion type="single" collapsible className="rounded border">
          <AccordionItem value="general-notes" className="border-0">
            <AccordionTrigger className="px-4 text-sm font-semibold">
              General Notes
            </AccordionTrigger>
            <AccordionContent className="px-4 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>This AI similarity tool provides advisory results only and does not constitute legal advice.</li>
                <li>Trademark applicants are advised to conduct comprehensive searches before filing.</li>
                <li>The similarity percentage is computed using deep learning image analysis models.</li>
                <li>Final approval is subject to formal evaluation by the Trademark Authority.</li>
                <li>Supported image formats: PNG, JPG (max 5MB).</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="how-it-works" className="border-0">
            <AccordionTrigger className="px-4 text-sm font-semibold">
              How It Works
            </AccordionTrigger>
            <AccordionContent className="px-4 text-sm text-muted-foreground">
              <ol className="list-decimal space-y-1 pl-5">
                <li>Upload your trademark logo on the Check Similarity page.</li>
                <li>Our AI model compares it against the database of registered trademarks.</li>
                <li>Review the similarity results and decide whether to proceed.</li>
                <li>Submit your application for formal review by an evaluator.</li>
                <li>Track your application status using your Application ID and email.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};

export default Index;
