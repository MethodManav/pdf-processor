"use client";

import { useState } from "react";
import { Upload, Loader2, Type, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

export default function PDFViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create object URL for PDF preview
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setExtractedText(response.data);
    } catch (err) {
      setError("Error processing PDF file");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>PDF Text Extractor</CardTitle>
          <CardDescription>
            Upload a PDF file to extract and view its content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!pdfUrl && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-10
                flex flex-col items-center justify-center gap-4
                transition-colors duration-200 hover:border-primary"
            >
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">
                  Drag and drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground">
                  Or click to select a file
                </p>
              </div>
              <div className="mt-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf"
                />
                <Button asChild>
                  <label htmlFor="file-upload">Select PDF</label>
                </Button>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 p-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing PDF...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* PDF and Text View */}
          {pdfUrl && extractedText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPdfUrl(null);
                    }}
                  >
                    Upload New PDF
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="split" className="w-full">
                <TabsList>
                  <TabsTrigger value="split">
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Split View
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Type className="w-4 h-4 mr-2" />
                    Text Only
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="split" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* PDF Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">PDF Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <iframe
                          src={pdfUrl}
                          className="w-full h-[600px] border rounded"
                          title="PDF Preview"
                        />
                      </CardContent>
                    </Card>

                    {/* Extracted Text */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Extracted Text
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[600px] w-full rounded border p-4">
                          {extractedText}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="text" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <ScrollArea className="h-[700px] w-full rounded border p-4">
                        {extractedText}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
