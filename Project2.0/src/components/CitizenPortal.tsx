import React, { useState } from 'react';
import { Plus, UserRound, MapPin, Check } from 'lucide-react';
import { Citizen, ActiveAlert } from '../types/livingLens';
import { calculateDistance } from '../utils/geoUtils';

interface CitizenPortalProps {
  citizens: Citizen[];
  activeCitizenId: string;
  onSelectCitizen: (citizenId: string) => void;
  onRegisterCitizen: (newCitizen: Omit<Citizen, 'id'>) => void;
  activeAlert: ActiveAlert | null;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  citizens,
  activeCitizenId,
  onSelectCitizen,
  onRegisterCitizen,
  activeAlert,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || !location.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Enter a name, valid email, location, and valid coordinates.');
      return;
    }
    onRegisterCitizen({ name: name.trim(), email: email.trim(), location: location.trim(), latitude: lat, longitude: lon });
    setName('');
    setEmail('');
    setLocation('');
    setLatitude('');
    setLongitude('');
    setError('');
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-screen-in">
      <section className="flex flex-col justify-between gap-5 border-b border-[#d5ded2] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#72816f]">Notification settings</p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#203a30] sm:text-[40px]">Recipients</h1>
          <p className="mt-2 text-sm text-[#68796c]">Manage the people and locations used for alert distance checks.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((visible) => !visible)}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#315640] px-5 text-sm font-medium text-white transition-colors hover:bg-[#264734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315640]"
        >
          <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Add recipient'}
        </button>
      </section>

      {showForm && (
        <form onSubmit={submit} className="max-w-3xl border-b border-[#d5ded2] pb-7">
          <h2 className="text-lg font-semibold text-[#294736]">New recipient</h2>
          <p className="mt-1 text-sm text-[#718075]">Add an email and location for geographic targeting.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className={inputClass} /></Field>
            <Field label="Email address"><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} /></Field>
            <Field label="Town or area"><input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="District or town" className={inputClass} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude"><input required type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="22.5" className={inputClass} /></Field>
              <Field label="Longitude"><input required type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="88.3" className={inputClass} /></Field>
            </div>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-800">{error}</p>}
          <button type="submit" className="mt-5 min-h-10 bg-[#dfe9b9] px-4 text-sm font-semibold text-[#294736] transition-colors hover:bg-[#d3e0b1]">Save recipient</button>
        </form>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#203a30]">Saved recipients</h2>
          <span className="text-sm text-[#718075]">{citizens.length}</span>
        </div>
        {citizens.length === 0 ? (
          <p className="border-y border-[#d5ded2] py-7 text-sm text-[#718075]">No recipients yet. Add someone to set up geographic targeting.</p>
        ) : (
          <div className="divide-y divide-[#d7dfd4] border-y border-[#d7dfd4]">
            {citizens.map((citizen) => {
              const selected = citizen.id === activeCitizenId;
              const distance = activeAlert
                ? calculateDistance(activeAlert.latitude, activeAlert.longitude, citizen.latitude, citizen.longitude)
                : null;
              return (
                <div key={citizen.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#718075]" strokeWidth={1.7} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#294736]">{citizen.name}{citizen.isDemo && <span className="ml-2 text-xs font-normal text-[#829084]">Sample contact</span>}</p>
                      <p className="mt-0.5 truncate text-sm text-[#68796c]">{citizen.email}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#829084]"><MapPin className="h-3 w-3" />{citizen.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pl-7 sm:justify-end sm:pl-0">
                    {distance !== null && <span className="text-sm tabular-nums text-[#68796c]">{distance.toFixed(1)} km from selected area</span>}
                    <button
                      type="button"
                      onClick={() => onSelectCitizen(citizen.id)}
                      aria-pressed={selected}
                      className={`inline-flex min-h-9 items-center gap-1.5 px-3 text-sm transition-colors ${selected ? 'bg-[#e3ebd8] text-[#36583d]' : 'border border-[#cbd6ca] text-[#526c60] hover:bg-[#f8faf5]'}`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}{selected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <p className="max-w-2xl text-xs leading-5 text-[#829084]">Sample contacts are included for the prototype. Emails are only sent for a qualifying analysis and only to non-sample recipients within the configured alert radius.</p>
    </div>
  );
};

const inputClass = 'min-h-11 w-full border border-[#cbd6ca] bg-[#f8faf5] px-3 text-sm text-[#203a30] placeholder:text-[#94a095] outline-none transition-colors focus:border-[#668348] focus:ring-2 focus:ring-[#668348]/15';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-[#345446]">{label}{children}</label>;
}
