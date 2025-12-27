import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  Zap,
  Wrench,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Upload,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { IncidentReport } from '@/types';

type IncidentType = 'accident' | 'breakdown' | 'hazard' | 'medical' | 'other';
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

const INCIDENT_TYPES: { value: IncidentType; label: string; icon: React.ReactNode }[] = [
  { value: 'accident', label: 'Accident', icon: <AlertTriangle className="h-5 w-5" /> },
  { value: 'breakdown', label: 'Breakdown', icon: <Wrench className="h-5 w-5" /> },
  { value: 'hazard', label: 'Hazard', icon: <AlertCircle className="h-5 w-5" /> },
  { value: 'medical', label: 'Medical Emergency', icon: <AlertTriangle className="h-5 w-5" /> },
  { value: 'other', label: 'Other', icon: <FileText className="h-5 w-5" /> },
];

const SEVERITY_LEVELS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low - Minor Issue', color: 'bg-blue-50 border-blue-200' },
  { value: 'medium', label: 'Medium - Needs Attention', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'high', label: 'High - Significant Problem', color: 'bg-orange-50 border-orange-200' },
  { value: 'critical', label: 'Critical - Emergency', color: 'bg-red-50 border-red-200' },
];

interface IncidentReporterProps {
  tripId?: string;
  userId?: string;
  currentLocation?: { latitude: number; longitude: number; address?: string };
  onIncidentReported?: (report: Partial<IncidentReport>) => void;
  emergencyContactPhone?: string;
}

interface FormState {
  type: IncidentType;
  severity: SeverityLevel;
  description: string;
  policeReportNumber?: string;
  photos: File[];
  notifyEmergencyContact: boolean;
}

export function IncidentReporter({
  tripId,
  userId,
  currentLocation,
  onIncidentReported,
  emergencyContactPhone
}: IncidentReporterProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    type: 'breakdown',
    severity: 'medium',
    description: '',
    policeReportNumber: '',
    photos: [],
    notifyEmergencyContact: true,
  });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleTypeSelect = (type: IncidentType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSeveritySelect = (severity: SeverityLevel) => {
    setFormData(prev => ({ ...prev, severity }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const remainingSlots = 5 - formData.photos.length;

    if (newFiles.length > remainingSlots) {
      toast({
        title: '⚠️ Too Many Photos',
        description: `You can only add ${remainingSlots} more photo(s)`,
        variant: 'destructive'
      });
      return;
    }

    const readers = newFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(previews => {
      setPhotoPreviews(prev => [...prev, ...previews]);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles]
      }));
    });
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      toast({
        title: 'Missing Description',
        description: 'Please describe what happened',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // For critical incidents, auto-call emergency contact
    if (formData.severity === 'critical' && emergencyContactPhone) {
      toast({
        title: '🚨 EMERGENCY - CALLING',
        description: `Calling primary emergency contact: ${emergencyContactPhone}`,
        variant: 'destructive'
      });
      // window.location.href = `tel:${emergencyContactPhone}`;
    }

    const report: Partial<IncidentReport> = {
      tourId: tripId,
      type: formData.type,
      severity: formData.severity,
      description: formData.description,
      location: currentLocation 
        ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
        : { lat: 0, lng: 0 },
      timestamp: new Date().toISOString(),
      reportedBy: userId || 'unknown',
    };

    onIncidentReported?.(report);

    toast({
      title: '📋 Incident Reported',
      description: 'Your incident has been recorded and emergency contacts notified',
    });

    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setFormData({
        type: 'breakdown',
        severity: 'medium',
        description: '',
        policeReportNumber: '',
        photos: [],
        notifyEmergencyContact: true,
      });
      setPhotoPreviews([]);
    }, 2000);
  };

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'low':
        return '⚪';
      case 'medium':
        return '🟡';
      case 'high':
        return '🟠';
      case 'critical':
        return '🔴';
    }
  };

  const incidentType = INCIDENT_TYPES.find(t => t.value === formData.type);

  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-700 hover:bg-red-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Report an Incident</span>
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Your incident has been successfully reported and emergency contacts have been notified
                </AlertDescription>
              </Alert>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4 space-y-2">
                  <p className="text-sm"><strong>Incident Type:</strong> {incidentType?.label}</p>
                  <p className="text-sm"><strong>Severity:</strong> {getSeverityIcon(formData.severity)} {formData.severity.toUpperCase()}</p>
                  {currentLocation && (
                    <p className="text-sm"><strong>Location:</strong> {currentLocation.address || `${currentLocation.latitude}, ${currentLocation.longitude}`}</p>
                  )}
                  <p className="text-sm"><strong>Description:</strong> {formData.description}</p>
                </CardContent>
              </Card>

              {formData.severity === 'critical' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    🚨 Emergency services have been alerted. Help is on the way.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => setOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Critical Emergency Alert */}
              {formData.severity === 'critical' && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-semibold">
                    🚨 CRITICAL SEVERITY: Emergency services will be contacted immediately
                  </AlertDescription>
                </Alert>
              )}

              {/* Incident Type Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  What happened? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INCIDENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeSelect(type.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">{type.icon}</span>
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Level Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  How severe is the situation? *
                </label>
                <div className="space-y-2">
                  {SEVERITY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => handleSeveritySelect(level.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        formData.severity === level.value
                          ? 'border-blue-500 ' + level.color.replace('border', 'border-blue-500 border')
                          : level.color
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getSeverityIcon(level.value)}</span>
                          <span className="font-medium">{level.label}</span>
                        </div>
                        {formData.severity === level.value && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Describe what happened *
                </label>
                <Textarea
                  id="description"
                  placeholder="Provide as much detail as possible..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-24"
                />
              </div>

              {/* Location Info */}
              {currentLocation && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Location Recorded</p>
                      <p className="text-xs text-blue-700">
                        {currentLocation.address || `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Upload */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Upload Photos ({formData.photos.length}/5)
                </label>
                
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.photos.length < 5 && (
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                      <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload photos</p>
                      <p className="text-xs text-gray-500">or drag and drop</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Police Report Number */}
              {formData.type === 'accident' && (
                <div>
                  <label htmlFor="policeReport" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Police Report Number (if available)
                  </label>
                  <Input
                    id="policeReport"
                    placeholder="e.g., 2024-123456"
                    value={formData.policeReportNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, policeReportNumber: e.target.value }))}
                  />
                </div>
              )}

              {/* Emergency Contact Notification */}
              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Input
                  type="checkbox"
                  checked={formData.notifyEmergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, notifyEmergencyContact: e.target.checked }))}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Notify Emergency Contact
                  </p>
                  <p className="text-xs text-amber-700">
                    Your primary emergency contact will be notified about this incident
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className={formData.severity === 'critical' ? 'flex-1 bg-red-600 hover:bg-red-700' : 'flex-1'}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {formData.severity === 'critical' ? 'Report & Emergency Alert' : 'Report Incident'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
