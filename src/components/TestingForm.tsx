import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Link2, Keyboard, Plus, Minus, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { callN8NWithAuth, checkAuthRequirements } from "@/lib/n8n-auth";
import { createApiTest } from "@/lib/api-tests";

type InputMode = "list" | "manual" | null;
type ListSource = "file" | "link" | null;
type CorsMode = "active" | "passive" | null;

const TestingForm = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [isManualExpanded, setIsManualExpanded] = useState(false);
  const [listSource, setListSource] = useState<ListSource>(null);
  const [manualInput, setManualInput] = useState("");
  const [linkUrls, setLinkUrls] = useState<string[]>([""]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [corsMode, setCorsMode] = useState<CorsMode>(null);
  const [originUrl, setOriginUrl] = useState("");
  const [recipientEmails, setRecipientEmails] = useState<string[]>([""]);  // NEW: For multiple recipient emails

  const testingMethods = [
    { id: "http", label: "HTTP Header Analysis / Content-Security-Policy / Missing HSTS Security Header" },
    { id: "ssl", label: "SSL / TLS Analysis / Improper TLS Version Used" },
    { id: "sensitive", label: "Server Version Disclosure" },
    { id: "cors", label: "CORS Validation" },
    { id: "error", label: "Improper Error Handling" },
    { id: "url", label: "URL Tampering" },
  ];

  const handleTestToggle = (testId: string) => {
    setSelectedTests((prev) => {
      // Single selection only - clicking same test deselects it, clicking different test selects only that one
      const newTests = prev.includes(testId)
        ? []  // Deselect if already selected
        : [testId];  // Select only this one test
      
      // Reset CORS settings if CORS is deselected
      if (testId === "cors" && !newTests.includes("cors")) {
        setCorsMode(null);
        setOriginUrl("");
      }
      
      return newTests;
    });
  };

  // Functions for managing multiple link URLs
  const addLinkUrl = () => {
    setLinkUrls([...linkUrls, ""]);
  };

  const removeLinkUrl = (index: number) => {
    if (linkUrls.length > 1) {
      setLinkUrls(linkUrls.filter((_, i) => i !== index));
    }
  };

  const updateLinkUrl = (index: number, value: string) => {
    const newUrls = [...linkUrls];
    newUrls[index] = value;
    setLinkUrls(newUrls);
  };

  // Functions for managing multiple recipient emails
  const addRecipientEmail = () => {
    setRecipientEmails([...recipientEmails, ""]);
  };

  const removeRecipientEmail = (index: number) => {
    if (recipientEmails.length > 1) {
      setRecipientEmails(recipientEmails.filter((_, i) => i !== index));
    }
  };

  const updateRecipientEmail = (index: number, value: string) => {
    const newEmails = [...recipientEmails];
    newEmails[index] = value;
    setRecipientEmails(newEmails);
  };

  // Handle Excel file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Check if file is Excel format
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Validate file type
    if (!validExtensions.includes(fileExtension) && !validMimeTypes.includes(file.type)) {
      toast.error("Invalid File Type", {
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file (.csv)",
        duration: 4000,
      });
      // Reset the input
      event.target.value = '';
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File Too Large", {
        description: "Please upload a file smaller than 5MB",
        duration: 4000,
      });
      event.target.value = '';
      return;
    }

    // File is valid
    setUploadedFile(file);
    toast.success("File Uploaded!", {
      description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      duration: 3000,
    });
  };

  const handleSubmit = async () => {
    console.log("🚀 START TESTING button clicked!");
    console.log("Input Mode:", inputMode);
    console.log("Manual Input:", manualInput);
    console.log("Link URLs:", linkUrls);
    console.log("Selected Tests:", selectedTests);
    console.log("CORS Mode:", corsMode);
    console.log("Origin URL:", originUrl);

    // Check authentication first
    const authStatus = await checkAuthRequirements();
    if (!authStatus.canUseApp) {
      toast.error(authStatus.message);
      return;
    }

    if (!inputMode) {
      console.log("❌ Validation failed: No input mode");
      toast.error("Please select an input mode");
      return;
    }
    if (inputMode === "manual" && !manualInput) {
      console.log("❌ Validation failed: No API URL");
      toast.error("Please enter an API URL");
      return;
    }
    if (inputMode === "list" && !listSource) {
      console.log("❌ Validation failed: No list source");
      toast.error("Please select a list source");
      return;
    }
    
    // Validate link URLs if link source is selected
    if (inputMode === "list" && listSource === "link") {
      const validUrls = linkUrls.filter(url => url.trim() !== "");
      if (validUrls.length === 0) {
        console.log("❌ Validation failed: No valid URLs");
        toast.error("Please enter at least one valid URL");
        return;
      }
    }
    
    // Validate file upload if file source is selected
    if (inputMode === "list" && listSource === "file") {
      if (!uploadedFile) {
        console.log("❌ Validation failed: No file uploaded");
        toast.error("Please upload an Excel file");
        return;
      }
    }
    if (selectedTests.length === 0) {
      console.log("❌ Validation failed: No tests selected");
      toast.error("Please select at least one testing method");
      return;
    }
    if (selectedTests.includes("cors") && !corsMode) {
      console.log("❌ Validation failed: CORS selected but no mode");
      toast.error("Please select CORS mode (Active or Passive)");
      return;
    }
    if (corsMode === "active" && !originUrl) {
      console.log("❌ Validation failed: Active CORS but no Origin URL");
      toast.error("Please enter Origin URL for Active CORS");
      return;
    }

    console.log("✅ All validations passed!");
    setIsLoading(true);
    
    // Map test IDs to n8n expected format
    const analysisTypeMapping: { [key: string]: string } = {
      "http": "http header analysis",
      "ssl": "SSL / TLS analysis",
      "sensitive": "Server version Disclosure",
      "error": "Improper Error Handling",
      "url": "URL Tampering Analysis",
    };

    // Build Analysis Type array (exclude CORS as it's separate)
    const analysisTypes = selectedTests
      .filter(test => test !== "cors")
      .map(test => analysisTypeMapping[test])
      .filter(Boolean);

    // Determine CORS Analysis Type
    let corsAnalysisType = "";
    if (selectedTests.includes("cors") && corsMode) {
      corsAnalysisType = corsMode === "active" ? "Active CORS Test" : "Passive CORS Test";
    }

    // Determine input method and prepare URLs
    let inputMethod = "single";
    let sourceType = "manual";
    let urlsToSend: string[] = [];

    if (inputMode === "manual") {
      inputMethod = "single";
      sourceType = "manual";
      urlsToSend = [manualInput];
    } else if (inputMode === "list" && listSource === "link") {
      const validUrls = linkUrls.filter(url => url.trim() !== "");
      inputMethod = validUrls.length > 1 ? "multiple" : "single";
      sourceType = "manual";
      urlsToSend = validUrls;
    } else if (inputMode === "list" && listSource === "file" && uploadedFile) {
      // Handle Excel file upload - send file to n8n
      inputMethod = "list";
      sourceType = "upload";
      urlsToSend = []; // No URLs yet, n8n will read the file
    }

    // Build payload matching n8n script expectations
    const payload: Record<string, unknown> = {
      "Input Method": inputMethod,
      "Source Type": sourceType,
      "Landing Page Url": urlsToSend[0] || "",
      "Batch URLs": urlsToSend,
      "Analysis Type": analysisTypes,
    };

    // Add CORS fields if CORS is selected
    if (corsAnalysisType) {
      payload["Cors Analysis Type"] = corsAnalysisType;
    }
    if (corsMode === "active" && originUrl) {
      payload["Origin"] = originUrl;
    }

    // Add recipient emails (filter out empty ones)
    const validRecipients = recipientEmails.filter(email => email.trim() !== "");
    if (validRecipients.length > 0) {
      payload["Recipient Emails"] = validRecipients.join(", ");
    }

    // 🆕 Create test record in Supabase BEFORE calling n8n
    const testRecord = await createApiTest({
      urls: urlsToSend.length > 0 ? urlsToSend : ["Pending file upload"],
      test_types: analysisTypes,
      cors_mode: corsAnalysisType || undefined,
      origin_url: originUrl || undefined,
      recipient_emails: validRecipients,
      user_email: validRecipients[0] || undefined,
    });

    if (!testRecord.success) {
      console.warn("⚠️ Failed to create test record:", testRecord.error);
      // Continue anyway - n8n can still process
    } else {
      console.log("✅ Test record created with ID:", testRecord.test_id);
      // Add test ID to payload so n8n can update it
      payload["Test ID"] = testRecord.test_id;
    }

    // Call n8n with Firebase authentication
    // For file uploads, pass the file separately
    const result = await callN8NWithAuth(payload, uploadedFile || undefined);
    
    setIsLoading(false);
    
    if (result.success) {
      if (inputMode === "list" && listSource === "file") {
        toast.success("🚀 Security Analysis Initiated!", {
          description: `File uploaded successfully! Track progress in Test History.`,
          duration: 5000,
          action: {
            label: 'View Status',
            onClick: () => navigate('/test-history')
          }
        });
      } else {
        const urlCount = urlsToSend.length;
        const urlText = urlCount === 1 ? "URL" : "URLs";
        toast.success("🚀 Security Analysis Initiated!", {
          description: `Testing started for ${urlCount} ${urlText}. Track progress in Test History.`,
          duration: 5000,
          action: {
            label: 'View Status',
            onClick: () => navigate('/test-history')
          }
        });
      }
      console.log("✅ Analysis Results:", result.data);
    } else {
      toast.error(result.error || "Failed to run analysis. Please try again.", {
        description: "Please check your connection and try again.",
        duration: 4000,
      });
      console.error("❌ Analysis failed:", result.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Mode Selection */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Testing Mode
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Card
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              inputMode === "list" ? "ring-1 ring-primary shadow-lg" : ""
            }`}
            onClick={() => {
              if (inputMode === "list") {
                // Toggle collapse/expand
                setIsListExpanded(!isListExpanded);
              } else {
                // Switch to list mode and expand
                setInputMode("list");
                setIsListExpanded(true);
                setIsManualExpanded(false);
                setManualInput("");
                setLinkUrls([""]);
                setUploadedFile(null);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary rounded-md">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">List of APIs</h4>
                  <p className="text-xs text-muted-foreground">
                    Upload or link
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                  inputMode === "list" && isListExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              inputMode === "manual" ? "ring-1 ring-primary shadow-lg" : ""
            }`}
            onClick={() => {
              if (inputMode === "manual") {
                // Toggle collapse/expand
                setIsManualExpanded(!isManualExpanded);
              } else {
                // Switch to manual mode and expand
                setInputMode("manual");
                setIsManualExpanded(true);
                setIsListExpanded(false);
                setListSource(null);
                setLinkUrls([""]);
                setUploadedFile(null);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary rounded-md">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Manual Input</h4>
                  <p className="text-xs text-muted-foreground">
                    Single API URL
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                  inputMode === "manual" && isManualExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Dynamic Input Section */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          (inputMode === "list" && isListExpanded) || (inputMode === "manual" && isManualExpanded)
            ? "max-h-[2000px] opacity-100" 
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-6">
          {inputMode === "list" && isListExpanded && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Source
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
              <Card
                className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
                  listSource === "file" ? "ring-1 ring-primary" : ""
                }`}
                onClick={() => setListSource("file")}
              >
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Excel</span>
                </div>
              </Card>
              <Card
                className={`p-3 cursor-pointer transition-all hover:shadow-lg ${
                  listSource === "link" ? "ring-1 ring-primary" : ""
                }`}
                onClick={() => setListSource("link")}
              >
                <div className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Input Link</span>
                </div>
              </Card>
            </div>
            {listSource === "file" && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Upload Excel File
                </h3>
                <Card className="p-4 border-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="flex items-center justify-center gap-2 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-all"
                    >
                      <div className="text-center">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        {uploadedFile ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Click to change file
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Click to upload Excel file
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports .xlsx, .xls, .csv (Max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  {uploadedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        const input = document.getElementById('excel-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="w-full mt-3"
                    >
                      Remove File
                    </Button>
                  )}
                </Card>
              </div>
            )}
            {listSource === "link" && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  API URLs / Links
                </h3>
                <Card className="p-4 border-2">
                  <div className="space-y-3">
                    {linkUrls.map((url, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          type="url"
                          placeholder={`API URL ${index + 1} (e.g., https://api.example.com)`}
                          value={url}
                          onChange={(e) => updateLinkUrl(index, e.target.value)}
                          className="h-10 text-sm flex-1 transition-all hover:shadow-md focus:shadow-lg"
                        />
                        {linkUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeLinkUrl(index)}
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all flex-shrink-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLinkUrl}
                      className="w-full transition-all hover:shadow-md hover:scale-[1.01]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another URL
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            </div>
          )}

          {inputMode === "manual" && isManualExpanded && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                API URL
              </h3>
              <Card className="p-4 border-2">
                <Input
                  type="url"
                  placeholder="https://example.com/api"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="h-10 text-sm transition-all hover:shadow-md focus:shadow-lg border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Testing Methods */}
      {inputMode && (isListExpanded || isManualExpanded) && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            TESTING METHODS
          </h3>
          <Card className="p-4 border-2">
            <div className="space-y-3">
              {testingMethods.map((test) => (
                <div key={test.id} className="flex items-center space-x-2 group">
                  <Checkbox
                    id={test.id}
                    checked={selectedTests.includes(test.id)}
                    onCheckedChange={() => handleTestToggle(test.id)}
                  />
                  <Label
                    htmlFor={test.id}
                    className="text-sm cursor-pointer font-medium group-hover:text-primary transition-colors"
                  >
                    {test.label}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          {/* CORS Configuration - Shows only if CORS is selected */}
          {selectedTests.includes("cors") && (
            <Card className="p-4 mt-3 animate-fade-in border-2 border-primary/30">
              <div className="space-y-4">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  CORS Configuration
                </h4>
                
                {/* CORS Mode Selection */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 group">
                    <input
                      type="radio"
                      id="cors-active"
                      name="corsMode"
                      checked={corsMode === "active"}
                      onChange={() => setCorsMode("active")}
                      className="w-4 h-4 text-primary cursor-pointer"
                    />
                    <Label
                      htmlFor="cors-active"
                      className="text-sm cursor-pointer font-medium group-hover:text-primary transition-colors"
                    >
                      Active CORS
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 group">
                    <input
                      type="radio"
                      id="cors-passive"
                      name="corsMode"
                      checked={corsMode === "passive"}
                      onChange={() => {
                        setCorsMode("passive");
                        setOriginUrl(""); // Clear origin URL when switching to passive
                      }}
                      className="w-4 h-4 text-primary cursor-pointer"
                    />
                    <Label
                      htmlFor="cors-passive"
                      className="text-sm cursor-pointer font-medium group-hover:text-primary transition-colors"
                    >
                      Passive CORS
                    </Label>
                  </div>
                </div>

                {/* Origin URL Input - Shows only for Active CORS */}
                {corsMode === "active" && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Origin URL
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={originUrl}
                      onChange={(e) => setOriginUrl(e.target.value)}
                      className="h-10 text-sm transition-all hover:shadow-md focus:shadow-lg"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Recipient Emails Section - Shows after selecting testing methods */}
      {inputMode && (isListExpanded || isManualExpanded) && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            📧 REPORT RECIPIENTS
          </h3>
          <Card className="p-4 border-2">
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Email addresses to receive security reports
              </Label>
              <p className="text-xs text-muted-foreground">
                Add one or more email addresses. Reports will be sent to all recipients.
              </p>
              {recipientEmails.map((email, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="email"
                    placeholder={`Recipient ${index + 1} (e.g., abc@example.com)`}
                    value={email}
                    onChange={(e) => updateRecipientEmail(index, e.target.value)}
                    className="h-10 text-sm flex-1 transition-all hover:shadow-md focus:shadow-lg"
                  />
                  {recipientEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRecipientEmail(index)}
                      className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all flex-shrink-0"
                      title="Remove this email"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRecipientEmail}
                className="w-full transition-all hover:shadow-md hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Recipient
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Submit Button */}
      {inputMode && (isListExpanded || isManualExpanded) && (
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          {isLoading ? "Analyzing..." : "Start Testing"}
        </Button>
      )}
    </div>
  );
};

export default TestingForm;
