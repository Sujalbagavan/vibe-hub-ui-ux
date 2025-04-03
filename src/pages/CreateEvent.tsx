
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EventCategory, VolunteerRole } from '@/types';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user, createEvent, loading } = useAppContext();
  
  // If not logged in or not an organizer, redirect to login
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'organizer') {
      toast.error('Only organizers can create events');
      navigate('/');
    }
  }, [user, navigate]);
  
  // Event details state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isFree, setIsFree] = useState(true);
  const [ticketPrice, setTicketPrice] = useState<string>('');
  const [totalSpots, setTotalSpots] = useState<string>('');
  
  // Location state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // Volunteer roles state
  const [volunteerRoles, setVolunteerRoles] = useState<VolunteerRole[]>([
    {
      id: `role-${Date.now()}`,
      title: '',
      description: '',
      spotsTotal: 1,
      spotsFilled: 0,
    },
  ]);
  
  const handleAddRole = () => {
    setVolunteerRoles([
      ...volunteerRoles,
      {
        id: `role-${Date.now()}`,
        title: '',
        description: '',
        spotsTotal: 1,
        spotsFilled: 0,
      },
    ]);
  };
  
  const handleRemoveRole = (index: number) => {
    setVolunteerRoles(volunteerRoles.filter((_, i) => i !== index));
  };
  
  const handleRoleChange = (index: number, field: keyof VolunteerRole, value: string | number) => {
    const updatedRoles = [...volunteerRoles];
    updatedRoles[index] = {
      ...updatedRoles[index],
      [field]: value,
    };
    setVolunteerRoles(updatedRoles);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !date || !startTime || !endTime || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!address || !city || !state || !zip) {
      toast.error('Please fill in all location fields');
      return;
    }
    
    if (!isFree) {
      if (!ticketPrice || Number(ticketPrice) <= 0) {
        toast.error('Please enter a valid ticket price');
        return;
      }
      if (!totalSpots || Number(totalSpots) <= 0) {
        toast.error('Please enter a valid number of total spots');
        return;
      }
    }
    
    // Validate volunteer roles
    for (const role of volunteerRoles) {
      if (!role.title || !role.description || role.spotsTotal <= 0) {
        toast.error('Please fill in all volunteer role fields');
        return;
      }
    }
    
    try {
      await createEvent({
        title,
        description,
        image,
        date,
        startTime,
        endTime,
        category: category as EventCategory,
        isFree,
        ticketPrice: isFree ? undefined : Number(ticketPrice),
        totalSpots: isFree ? undefined : Number(totalSpots),
        spotsRemaining: isFree ? undefined : Number(totalSpots),
        location: {
          address,
          city,
          state,
          zip,
        },
        volunteerRoles,
      });
      
      toast.success('Event created successfully');
      navigate('/events');
    } catch (error) {
      // Error is handled in context
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  Provide basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g., Community Cleanup at City Park"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-32"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/event-image.jpg"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Enter a URL for your event banner image
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Charity">Charity</SelectItem>
                        <SelectItem value="Meetup">Meetup</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label>Event Type <span className="text-red-500">*</span></Label>
                  <RadioGroup 
                    value={isFree ? 'free' : 'paid'} 
                    onValueChange={(value) => setIsFree(value === 'free')}
                    className="space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free">Free Event</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paid" id="paid" />
                      <Label htmlFor="paid">Paid Event</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {!isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Ticket Price ($) <span className="text-red-500">*</span></Label>
                      <Input
                        id="ticketPrice"
                        type="number"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalSpots">Total Available Spots <span className="text-red-500">*</span></Label>
                      <Input
                        id="totalSpots"
                        type="number"
                        placeholder="100"
                        min="1"
                        value={totalSpots}
                        onChange={(e) => setTotalSpots(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Where will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    placeholder="123 Main St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="zip"
                      placeholder="94110"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Volunteer Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Roles</CardTitle>
                <CardDescription>
                  Define roles for volunteers at your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {volunteerRoles.map((role, index) => (
                  <div key={role.id} className="space-y-4 pb-4 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Role #{index + 1}</h3>
                      {volunteerRoles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRole(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`role-title-${index}`}>Role Title <span className="text-red-500">*</span></Label>
                        <Input
                          id={`role-title-${index}`}
                          placeholder="e.g., Registration Desk"
                          value={role.title}
                          onChange={(e) => handleRoleChange(index, 'title', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`role-description-${index}`}>Description <span className="text-red-500">*</span></Label>
                        <Textarea
                          id={`role-description-${index}`}
                          placeholder="What will volunteers do in this role?"
                          value={role.description}
                          onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`role-spots-${index}`}>Number of Spots <span className="text-red-500">*</span></Label>
                        <Input
                          id={`role-spots-${index}`}
                          type="number"
                          min="1"
                          placeholder="5"
                          value={role.spotsTotal}
                          onChange={(e) => handleRoleChange(index, 'spotsTotal', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddRole}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Role
                </Button>
              </CardContent>
            </Card>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateEvent;
