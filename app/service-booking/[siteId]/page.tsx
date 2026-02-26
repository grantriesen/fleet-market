// app/service-booking/[siteId]/page.tsx
// Standalone customer-facing booking page for testing the public API
// URL: /service-booking/YOUR_SITE_ID
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_estimate: string;
  category: string;
}

interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
}

type Step = 'service' | 'details' | 'schedule' | 'confirm' | 'success';

export default function ServiceBookingPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [step, setStep] = useState<Step>('service');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Data
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');

  // Form state
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    equipmentType: '',
    equipmentMake: '',
    equipmentModel: '',
    customDescription: '',
    customerNotes: '',
    preferredDate: '',
    preferredTime: '',
  });

  // Result
  const [result, setResult] = useState<any>(null);

  // Load service types
  useEffect(() => {
    loadServiceTypes();
  }, [siteId]);

  async function loadServiceTypes() {
    try {
      const res = await fetch(`/api/service/types/${siteId}`);
      if (!res.ok) throw new Error('Failed to load service types');
      const data = await res.json();
      setServiceTypes(data.types || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load available slots when date changes
  async function loadSlots(date: string) {
    if (!date) { setSlots([]); return; }
    setSlotsLoading(true);
    setSlotsMessage('');
    try {
      const typeParam = selectedType ? `&typeId=${selectedType.id}` : `&duration=60`;
      const res = await fetch(`/api/service/slots/${siteId}?date=${date}${typeParam}`);
      if (!res.ok) throw new Error('Failed to load slots');
      const data = await res.json();

      if (data.blocked) {
        setSlotsMessage('This date is unavailable.');
        setSlots([]);
      } else if (data.closed) {
        setSlotsMessage('We\'re closed on this day. Please pick another date.');
        setSlots([]);
      } else {
        setSlots(data.slots || []);
        if (data.slots?.length === 0) setSlotsMessage('No available time slots for this date.');
      }
    } catch (err: any) {
      setSlotsMessage('Error loading time slots.');
    } finally {
      setSlotsLoading(false);
    }
  }

  // Submit booking
  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/service/book/${siteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone || null,
          serviceTypeId: isCustom ? null : selectedType?.id,
          customDescription: isCustom ? form.customDescription : null,
          equipmentType: form.equipmentType || null,
          equipmentMake: form.equipmentMake || null,
          equipmentModel: form.equipmentModel || null,
          preferredDate: isCustom ? null : form.preferredDate || null,
          preferredTime: isCustom ? null : form.preferredTime || null,
          customerNotes: form.customerNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setResult(data);
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Validation
  const canProceedFromDetails = form.customerName.trim() && form.customerEmail.trim();
  const canProceedFromSchedule = isCustom || (form.preferredDate && form.preferredTime);

  // Today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading services...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Schedule Service</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Book an appointment online — we'll confirm your time.</p>
        </div>

        {/* Progress Steps */}
        {step !== 'success' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            {(['service', 'details', 'schedule', 'confirm'] as Step[]).map((s, i) => {
              const steps: Step[] = ['service', 'details', 'schedule', 'confirm'];
              const currentIndex = steps.indexOf(step);
              const stepIndex = i;
              const isActive = stepIndex === currentIndex;
              const isComplete = stepIndex < currentIndex;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700,
                    background: isComplete ? '#16a34a' : isActive ? '#2563eb' : '#e2e8f0',
                    color: isComplete || isActive ? 'white' : '#94a3b8',
                  }}>
                    {isComplete ? '✓' : i + 1}
                  </div>
                  {i < 3 && <div style={{ width: 32, height: 2, background: isComplete ? '#16a34a' : '#e2e8f0' }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>×</button>
          </div>
        )}

        {/* ===== STEP 1: CHOOSE SERVICE ===== */}
        {step === 'service' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>What do you need?</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {serviceTypes.map(type => (
                <button key={type.id} onClick={() => { setSelectedType(type); setIsCustom(false); setStep('details'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'white', borderRadius: 12,
                    border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                    🔧
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{type.name}</div>
                    {type.description && <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>{type.description}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {type.price_estimate && <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{type.price_estimate}</div>}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{type.duration_minutes} min</div>
                  </div>
                </button>
              ))}

              {/* Other / Custom */}
              <button onClick={() => { setSelectedType(null); setIsCustom(true); setStep('details'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: 12,
                  border: '1px dashed #cbd5e1', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                  💬
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>Something Else</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Describe what you need and we'll contact you.</div>
                </div>
              </button>
            </div>

            {serviceTypes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <p>No services available for online booking right now.</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>Please call us directly to schedule service.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: YOUR DETAILS ===== */}
        {step === 'details' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Your Details</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {isCustom ? 'Tell us about yourself and what you need.' : `Booking: ${selectedType?.name}`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="John Smith" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="(555) 123-4567" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="you@email.com" style={inputStyle} />
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>Equipment (optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <input type="text" value={form.equipmentType} onChange={(e) => setForm({ ...form, equipmentType: e.target.value })}
                      placeholder="Mower" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Make</label>
                    <input type="text" value={form.equipmentMake} onChange={(e) => setForm({ ...form, equipmentMake: e.target.value })}
                      placeholder="Toro" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Model</label>
                    <input type="text" value={form.equipmentModel} onChange={(e) => setForm({ ...form, equipmentModel: e.target.value })}
                      placeholder="Titan MX5400" style={inputStyle} />
                  </div>
                </div>
              </div>

              {isCustom && (
                <div>
                  <label style={labelStyle}>Describe what you need *</label>
                  <textarea value={form.customDescription} onChange={(e) => setForm({ ...form, customDescription: e.target.value })}
                    rows={3} placeholder="Tell us about the service or repair you need..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              )}

              {!isCustom && (
                <div>
                  <label style={labelStyle}>Additional notes</label>
                  <textarea value={form.customerNotes} onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
                    rows={2} placeholder="Anything else we should know?" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setStep('service')} style={secondaryBtnStyle}>← Back</button>
              <button onClick={() => setStep(isCustom ? 'confirm' : 'schedule')} disabled={!canProceedFromDetails}
                style={{ ...primaryBtnStyle, opacity: canProceedFromDetails ? 1 : 0.5 }}>
                {isCustom ? 'Review & Submit' : 'Choose Time →'}
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: SCHEDULE (not for custom requests) ===== */}
        {step === 'schedule' && !isCustom && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Pick a Date & Time</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {selectedType?.name} · {selectedType?.duration_minutes} min
            </p>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Preferred Date *</label>
                <input type="date" value={form.preferredDate} min={today}
                  onChange={(e) => {
                    setForm({ ...form, preferredDate: e.target.value, preferredTime: '' });
                    loadSlots(e.target.value);
                  }}
                  style={{ ...inputStyle, maxWidth: 220 }} />
              </div>

              {form.preferredDate && (
                <div>
                  <label style={labelStyle}>Available Times *</label>

                  {slotsLoading && (
                    <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Loading available times...</div>
                  )}

                  {slotsMessage && !slotsLoading && (
                    <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', color: '#92400e', fontSize: '0.875rem' }}>
                      {slotsMessage}
                    </div>
                  )}

                  {!slotsLoading && slots.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.375rem' }}>
                      {slots.map(slot => (
                        <button key={slot.time} onClick={() => slot.available && setForm({ ...form, preferredTime: slot.time })}
                          disabled={!slot.available}
                          style={{
                            padding: '0.625rem 0.5rem', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: slot.available ? 'pointer' : 'not-allowed',
                            border: form.preferredTime === slot.time ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            background: !slot.available ? '#f1f5f9' : form.preferredTime === slot.time ? '#eff6ff' : 'white',
                            color: !slot.available ? '#cbd5e1' : form.preferredTime === slot.time ? '#2563eb' : '#475569',
                            textDecoration: !slot.available ? 'line-through' : 'none',
                          }}>
                          {slot.display}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setStep('details')} style={secondaryBtnStyle}>← Back</button>
              <button onClick={() => setStep('confirm')} disabled={!canProceedFromSchedule}
                style={{ ...primaryBtnStyle, opacity: canProceedFromSchedule ? 1 : 0.5 }}>
                Review & Confirm →
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: CONFIRM ===== */}
        {step === 'confirm' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Review Your Booking</h2>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              {/* Service */}
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Service</div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>
                  {isCustom ? 'Custom Request' : selectedType?.name}
                </div>
                {isCustom && form.customDescription && (
                  <p style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic', marginTop: '0.25rem' }}>"{form.customDescription}"</p>
                )}
                {!isCustom && selectedType && (
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                    {selectedType.duration_minutes} min · {selectedType.price_estimate}
                  </div>
                )}
              </div>

              {/* Schedule (if not custom) */}
              {!isCustom && form.preferredDate && (
                <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>When</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {new Date(form.preferredDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  {form.preferredTime && (
                    <div style={{ fontSize: '0.875rem', color: '#3b82f6' }}>
                      {(() => {
                        const [h, m] = form.preferredTime.split(':').map(Number);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        return `${dh}:${String(m).padStart(2, '0')} ${ampm}`;
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Contact */}
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Contact</div>
                <div style={{ fontWeight: 500, color: '#0f172a' }}>{form.customerName}</div>
                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{form.customerEmail}</div>
                {form.customerPhone && <div style={{ fontSize: '0.875rem', color: '#475569' }}>{form.customerPhone}</div>}
              </div>

              {/* Equipment */}
              {(form.equipmentType || form.equipmentMake) && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Equipment</div>
                  <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                    {[form.equipmentType, form.equipmentMake, form.equipmentModel].filter(Boolean).join(' · ')}
                  </div>
                </div>
              )}
            </div>

            {isCustom && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: '0.8125rem', color: '#92400e' }}>
                Since this is a custom request, our team will contact you to discuss your needs and schedule an appointment.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setStep(isCustom ? 'details' : 'schedule')} style={secondaryBtnStyle}>← Back</button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ ...primaryBtnStyle, background: '#16a34a', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Booking...' : isCustom ? 'Submit Request' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 5: SUCCESS ===== */}
        {step === 'success' && result && (
          <div style={{ textAlign: 'center', background: 'white', padding: '2.5rem', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
              ✅
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              {result.status === 'confirmed' ? 'Appointment Confirmed!' : 'Request Submitted!'}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9375rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              {result.message}
            </p>

            {/* Debug info for testing */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 10, textAlign: 'left', fontSize: '0.8125rem', color: '#64748b' }}>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>🧪 Debug Info (for testing):</div>
              <div>Appointment ID: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>{result.appointmentId}</code></div>
              <div>Status: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>{result.status}</code></div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                → Check your dealer dashboard at <strong>/dashboard/service</strong> to see this appointment in the queue.
              </div>
            </div>

            <button onClick={() => { setStep('service'); setForm({ customerName: '', customerEmail: '', customerPhone: '', equipmentType: '', equipmentMake: '', equipmentModel: '', customDescription: '', customerNotes: '', preferredDate: '', preferredTime: '' }); setSelectedType(null); setIsCustom(false); setResult(null); }}
              style={{ ...primaryBtnStyle, marginTop: '1.5rem' }}>
              Book Another Service
            </button>
          </div>
        )}

        {/* Site ID display for testing */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#cbd5e1' }}>
          Site ID: {siteId}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Shared styles
// ============================================
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem', outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: '#2563eb', color: 'white', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer',
};
