import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Label,
  Switch,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/settings";
import Input from "./ui/inputComponent";

import { Shield, Mail, Bell, Brain, Save } from "lucide-react";

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    selectedModel: "Basic Detection",
    confidenceThreshold: 0.6,
    emailAddress: "admin@example.com",
    attackTypes: {
      ddos: true,
      ddosAttack: true,
      portScan: false,
      bruteforce: false,
    },
    alertFrequency: "Real-Time",
    aggregationWindow: "5min",
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setShowSaveDialog(true);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
        <p className="text-gray-600">
          Configure your DDoS detection preferences and alert notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detection Model Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Detection Model</Label>
              <Select
                value={settings.selectedModel}
                onValueChange={(value) =>
                  setSettings({ ...settings, selectedModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    value={settings.selectedModel}
                    placeholder="Select a model"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic Detection">
                    Basic Detection
                  </SelectItem>
                  <SelectItem value="Enhanced Detection">
                    Enhanced Detection
                  </SelectItem>
                  <SelectItem value="Advanced ML Mode">
                    Advanced ML Model
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="text-sm text-gray-500">
                Choose the detection model that best suits your needs
              </p>
            </div>

            <div className="space-y-2">
              <Label>Confidence Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      confidenceThreshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-500">(0.0 - 1.0)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Label>Attack Types to Monitor</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ddos" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    DDoS Attempts
                  </Label>
                  <Switch
                    id="ddos"
                    checked={settings.attackTypes.ddos}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        attackTypes: { ...settings.attackTypes, ddos: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="ddosAttack"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    DDoS Attacks
                  </Label>
                  <Switch
                    id="ddosAttack"
                    checked={settings.attackTypes.ddosAttack}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        attackTypes: {
                          ...settings.attackTypes,
                          ddosAttack: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="portScan" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Port Scanning
                  </Label>
                  <Switch
                    id="portScan"
                    checked={settings.attackTypes.portScan}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        attackTypes: {
                          ...settings.attackTypes,
                          portScan: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="bruteforce"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Brute Force Attempts
                  </Label>
                  <Switch
                    id="bruteforce"
                    checked={settings.attackTypes.bruteforce}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        attackTypes: {
                          ...settings.attackTypes,
                          bruteforce: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alert Frequency</Label>
              <Select
                value={settings.alertFrequency}
                onValueChange={(value) =>
                  setSettings({ ...settings, alertFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    value={settings.alertFrequency}
                    placeholder="Select frequency"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Real-time">Real-time</SelectItem>
                  <SelectItem value="Aggregated">Aggregated</SelectItem>
                  <SelectItem value="Daily Digest">Daily Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.alertFrequency === "aggregate" && (
              <div className="space-y-2">
                <Label>Aggregation Window</Label>
                <Select
                  value={settings.aggregationWindow}
                  onValueChange={(value) =>
                    setSettings({ ...settings, aggregationWindow: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5min">5 minutes</SelectItem>
                    <SelectItem value="15min">15 minutes</SelectItem>
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1hour">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">
                Enable Email Notifications
              </Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            {settings.emailNotifications && (
              <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, emailAddress: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Settings Saved Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your security settings have been updated. The new configuration
              will take effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSaveDialog(false)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SecuritySettings;
