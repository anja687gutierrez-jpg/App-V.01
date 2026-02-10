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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  Trash2,
  Edit2,
  Plus,
  Users,
  Globe,
  Share2,
  Heart,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ExtendedEmergencyContact } from '@/types';

const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+31', country: 'Netherlands' },
  { code: '+43', country: 'Austria' },
  { code: '+41', country: 'Switzerland' },
  { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' },
  { code: '+45', country: 'Denmark' },
  { code: '+352', country: 'Luxembourg' },
  { code: '+32', country: 'Belgium' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+36', country: 'Hungary' },
  { code: '+48', country: 'Poland' },
  { code: '+40', country: 'Romania' },
  { code: '+358', country: 'Finland' },
  { code: '+30', country: 'Greece' },
  { code: '+90', country: 'Turkey' },
  { code: '+972', country: 'Israel' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+971', country: 'UAE' },
  { code: '+974', country: 'Qatar' },
  { code: '+886', country: 'Taiwan' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'South Korea' },
  { code: '+60', country: 'Malaysia' },
  { code: '+65', country: 'Singapore' },
  { code: '+66', country: 'Thailand' },
  { code: '+84', country: 'Vietnam' },
  { code: '+62', country: 'Indonesia' },
  { code: '+63', country: 'Philippines' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' },
  { code: '+92', country: 'Pakistan' },
  { code: '+61', country: 'Australia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+55', country: 'Brazil' },
  { code: '+54', country: 'Argentina' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+52', country: 'Mexico' },
];

const RELATIONSHIPS = [
  'family',
  'friend',
  'colleague',
  'medical',
  'other',
] as const;

interface EmergencyContactsManagerProps {
  contacts: ExtendedEmergencyContact[];
  onAddContact: (contact: Omit<ExtendedEmergencyContact, 'id'>) => void;
  onUpdateContact: (id: string, contact: Partial<ExtendedEmergencyContact>) => void;
  onDeleteContact: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

interface FormData {
  name: string;
  phone: string;
  countryCode: string;
  relationship: 'family' | 'friend' | 'colleague' | 'medical' | 'other';
  isPrimary: boolean;
  isTrusted: boolean;
  shareLocationDuringTrips: boolean;
}

export function EmergencyContactsManager({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onSetPrimary
}: EmergencyContactsManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    countryCode: '+1',
    relationship: 'friend',
    isPrimary: false,
    isTrusted: false,
    shareLocationDuringTrips: false,
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: 'Missing Name',
        description: 'Please enter contact name',
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({
        title: 'Missing Phone',
        description: 'Please enter phone number',
        variant: 'destructive'
      });
      return false;
    }
    if (formData.phone.length < 7) {
      toast({
        title: 'Invalid Phone',
        description: 'Phone number seems too short',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingId) {
      onUpdateContact(editingId, formData);
      toast({
        title: 'Contact Updated',
        description: `${formData.name} has been updated`,
      });
    } else {
        onAddContact({
        name: formData.name,
        phone: formData.phone,
        relation: formData.relationship,
        countryCode: formData.countryCode,
        relationship: formData.relationship,
        isPrimary: formData.isPrimary,
        isTrusted: formData.isTrusted,
        shareLocationDuringTrips: formData.shareLocationDuringTrips,
      });
      toast({
        title: 'Contact Added',
        description: `${formData.name} has been added`,
      });
    }

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      countryCode: '+1',
      relationship: 'friend',
      isPrimary: false,
      isTrusted: false,
      shareLocationDuringTrips: false,
    });
    setEditingId(null);
  };

  const handleEdit = (contact: ExtendedEmergencyContact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      countryCode: contact.countryCode,
      relationship: contact.relationship as 'family' | 'friend' | 'colleague' | 'medical' | 'other',
      isPrimary: contact.isPrimary,
      isTrusted: contact.isTrusted,
      shareLocationDuringTrips: contact.shareLocationDuringTrips,
    });
    setEditingId(contact.id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (window.confirm(`Delete ${contact?.name}?`)) {
      onDeleteContact(id);
      toast({
        title: 'Contact Deleted',
        description: `${contact?.name} has been removed`,
      });
    }
  };

  const primaryContact = contacts.find(c => c.isPrimary);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Emergency Contacts
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mom"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <Label>Phone Number *</Label>
                <div className="flex space-x-2 mt-1">
                  <Select value={formData.countryCode} onValueChange={(value) => handleInputChange('countryCode', value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map(cc => (
                        <SelectItem key={cc.code} value={cc.code}>
                          {cc.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="555-1234"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: {formData.countryCode} {formData.phone || '555-1234'}
                </p>
              </div>

              {/* Relationship */}
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                  <SelectTrigger id="relationship" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map(rel => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 bg-gray-50 p-3 rounded">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onCheckedChange={(checked) => handleInputChange('isPrimary', checked)}
                  />
                  <Label htmlFor="isPrimary" className="text-sm font-normal cursor-pointer">
                    <Heart className="h-4 w-4 inline mr-1 text-red-500" />
                    Set as primary (used for SOS button)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTrusted"
                    checked={formData.isTrusted}
                    onCheckedChange={(checked) => handleInputChange('isTrusted', checked)}
                  />
                  <Label htmlFor="isTrusted" className="text-sm font-normal cursor-pointer">
                    <Globe className="h-4 w-4 inline mr-1 text-blue-500" />
                    Mark as trusted contact
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shareLocation"
                    checked={formData.shareLocationDuringTrips}
                    onCheckedChange={(checked) => handleInputChange('shareLocationDuringTrips', checked)}
                  />
                  <Label htmlFor="shareLocation" className="text-sm font-normal cursor-pointer">
                    <Share2 className="h-4 w-4 inline mr-1 text-green-500" />
                    Share location during trips
                  </Label>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {editingId ? 'Update Contact' : 'Add Contact'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts List */}
      <div className="space-y-2">
        {contacts.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="py-8 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">No emergency contacts yet</p>
              <p className="text-xs text-gray-400 mt-1">Add contacts for emergency situations</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map(contact => (
            <Card key={contact.id} className={contact.isPrimary ? 'border-2 border-red-200 bg-red-50' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      {contact.isPrimary && (
                        <Badge className="bg-red-500 text-white">
                          <Heart className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      {contact.isTrusted && (
                        <Badge variant="secondary">Trusted</Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.countryCode} {contact.phone}
                      </div>
                      <div className="text-gray-500">
                        {contact.relationship || contact.relation}
                      </div>
                      {contact.shareLocationDuringTrips && (
                        <div className="flex items-center text-green-600 text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          Location sharing enabled
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {!contact.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Set as primary"
                        onClick={() => {
                          onSetPrimary(contact.id);
                          toast({
                            title: 'Primary Contact Updated',
                            description: `${contact.name} is now your primary emergency contact`,
                          });
                        }}
                      >
                        <Heart className="h-4 w-4 text-gray-400" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tips for International Travel */}
      {contacts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-900">
              ✈️ International Travel Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-blue-800 space-y-1">
            <p>• Make sure all contacts have your international number if traveling abroad</p>
            <p>• Verify country codes match your contacts' locations</p>
            <p>• Inform trusted contacts about your trip dates and route</p>
            <p>• Have at least 2-3 trusted contacts for check-ins</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
