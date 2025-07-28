import React from 'react';
import type { ApplicationDto, Day } from '../../../interfaces/application/Application';
import TermSelector from '../../../components/features/application/applicationsubmission/TermSelector';
import TermForm from '../../../components/features/application/applicationsubmission/TermForm';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { dayMap, getDateForDay, colorByDay } from '../../../components/features/application/applicationsubmission/availabilityUtils';

interface Availability {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

interface ApplicationFormProps {
  selectedTerms: string[];
  existingTerms: Set<string>;
  termFormsData: { [termKey: string]: any };
  errors: { [key: string]: string };
  activeFormTab: string;
  availability: Availability[];
  calendarRef: React.RefObject<FullCalendar>;
  handleTermSelection: (termKey: string, isSelected: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleDateSelect: (info: any) => void;
  handleEventClick: (info: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  getTermFormData: (termKey: string) => any;
  setActiveFormTab: (termKey: string) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  selectedTerms,
  existingTerms,
  termFormsData,
  errors,
  activeFormTab,
  availability,
  calendarRef,
  handleTermSelection,
  handleChange,
  handleDateSelect,
  handleEventClick,
  handleSubmit,
  getTermFormData,
  setActiveFormTab,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Term Selection */}
      <TermSelector
        selectedTerms={selectedTerms}
        existingTerms={existingTerms}
        onTermToggle={handleTermSelection}
      />
      {/* Show error for general validation */}
      {errors.general && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {errors.general}
        </div>
      )}
      {/* Term Forms Tabs */}
      {selectedTerms.length > 0 && (
        <div>
          {/* Tab Headers */}
          {selectedTerms.length > 1 && (
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Terms">
                {selectedTerms.map(termKey => {
                  const [year, semester] = termKey.split('-');
                  const isActive = activeFormTab === termKey;
                  const hasExisting = existingTerms.has(termKey);
                  return (
                    <button
                      key={termKey}
                      type="button"
                      onClick={() => setActiveFormTab(termKey)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {year} {semester}
                      {hasExisting && (
                        <span className="ml-2 text-xs text-orange-600">(Update)</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
          {/* Active Form Content */}
          <div>
            {(selectedTerms.length === 1 ? selectedTerms : [activeFormTab]).filter(Boolean).map(termKey => (
              <div key={termKey} className={selectedTerms.length > 1 && termKey !== activeFormTab ? 'hidden' : ''}>
                <TermForm
                  termKey={termKey}
                  formData={getTermFormData(termKey)}
                  errors={errors}
                  handleChange={handleChange}
                  isUpdate={existingTerms.has(termKey)}
                />
              </div>
            ))}
            {/* Availability Calendar */}
            <section className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Availability*</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select your available time slots by dragging on the calendar. This applies to all selected terms.
              </p>
              <div className="bg-white rounded shadow p-2">
                <FullCalendar
                  ref={calendarRef as any}
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  allDaySlot={false}
                  headerToolbar={false}
                  slotMinTime="06:00:00"
                  slotMaxTime={`18:00:00`}
                  height="auto"
                  selectable
                  selectMirror
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  events={availability.map(av => ({
                    id: av.id,
                    start: getDateForDay(av.day, av.startTime),
                    end: getDateForDay(av.day, av.endTime),
                    backgroundColor: colorByDay[av.day],
                    borderColor: colorByDay[av.day],
                  }))}
                  dayHeaderFormat={{ weekday: 'long' }}
                  slotEventOverlap={false}
                  expandRows={true}
                  contentHeight="auto"
                  hiddenDays={[0, 6]}
                />
              </div>
              {errors.availability && <p className="text-sm text-red-600 mt-1">{errors.availability}</p>}
            </section>
            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={selectedTerms.length === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  selectedTerms.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#040941] text-white hover:bg-[#030735] focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {selectedTerms.some(term => existingTerms.has(term)) 
                  ? `Update Application${selectedTerms.length > 1 ? 's' : ''}` 
                  : `Submit Application${selectedTerms.length > 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ApplicationForm;
