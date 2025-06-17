import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockCourseList from '../../mocked-objects/mockCourses';

const ApplicationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstPreference: '',
    secondPreference: '',
    thirdPreference: '',
    wantWorkingHours: '',
    completedCourseInput: '',
    completedCourses: [] as string[],
    wantRemote: '',
    transcriptFile: null as File | null,
    confirmProfileUpdated: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    if (type === 'checkbox' && name === 'confirmProfileUpdated') {
      setFormData((prev) => ({ ...prev, confirmProfileUpdated: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        transcriptFile: files && files.length > 0 ? files[0] : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddCourse = () => {
    const input = formData.completedCourseInput.trim();
    if (input && !formData.completedCourses.includes(input)) {
      setFormData((prev) => ({
        ...prev,
        completedCourses: [...prev.completedCourses, input],
        completedCourseInput: '',
      }));
      setErrors((prev) => ({ ...prev, completedCourses: '' }));
    }
  };

  const handleRemoveCourse = (course: string) => {
    setFormData((prev) => ({
      ...prev,
      completedCourses: prev.completedCourses.filter((c) => c !== course),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstPreference)
      newErrors.firstPreference = '1st preference is required.';
    if (!formData.secondPreference)
      newErrors.secondPreference = '2nd preference is required.';
    if (!formData.thirdPreference)
      newErrors.thirdPreference = '3rd preference is required.';
    if (!formData.wantWorkingHours)
      newErrors.wantWorkingHours = 'Hours requested is required.';
    if (formData.completedCourses.length === 0)
      newErrors.completedCourses = 'Add at least one completed course.';
    if (!formData.wantRemote)
      newErrors.wantRemote = 'Select a remote work preference.';
    if (!formData.transcriptFile)
      newErrors.transcriptFile = 'Upload your transcript.';
    if (!formData.confirmProfileUpdated)
      newErrors.confirmProfileUpdated =
        'Please confirm that your profile is up to date.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmittedData(formData);
  };

  const filteredCourses = mockCourseList.filter((course) =>
    course.toLowerCase().includes(formData.completedCourseInput.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-8 bg-[#f4f6fc]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#040941] mb-6">
          TA Application Submission
        </h1>

        <div className="w-full bg-white p-10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)]">
          {submittedData ? (
            <div className="bg-green-50 border border-green-300 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                Submission Summary
              </h2>
              <p>
                <strong>1st Preference*:</strong> {submittedData.firstPreference}
              </p>
              <p>
                <strong>2nd Preference*:</strong> {submittedData.secondPreference}
              </p>
              <p>
                <strong>3rd Preference*:</strong> {submittedData.thirdPreference}
              </p>
              <p>
                <strong>Hours Requested*:</strong> {submittedData.wantWorkingHours}
              </p>
              <p>
                <strong>Completed Courses*:</strong>{' '}
                {submittedData.completedCourses.join(', ')}
              </p>
              <p>
                <strong>Remote Preference*:</strong> {submittedData.wantRemote}
              </p>
              <p>
                <strong>Transcript Uploaded*:</strong>{' '}
                {submittedData.transcriptFile?.name}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
             
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['firstPreference','secondPreference','thirdPreference'] as const).map(
                  (pref) => (
                    <div key={pref}>
                      <label className="block mb-1 font-medium">
                        {pref === 'firstPreference'
                          ? '1st Preference*'
                          : pref === 'secondPreference'
                          ? '2nd Preference*'
                          : '3rd Preference*'}
                      </label>
                      <select
                        name={pref}
                        value={formData[pref]}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Select</option>
                        {mockCourseList.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                      {errors[pref] && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors[pref]}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              
              <div>
                <label className="block mb-2 font-medium">
                  Hours Requested*
                </label>
                <input
                  type="number"
                  name="wantWorkingHours"
                  value={formData.wantWorkingHours}
                  onChange={handleChange}
                  min={0}
                  max={40}
                  step={1}
                  className="w-64 border rounded px-3 py-2"
                  placeholder="Enter hours"
                />
                {errors.wantWorkingHours && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.wantWorkingHours}
                  </p>
                )}
              </div>

             
              <div>
                <label className="block mb-2 font-medium">
                  Completed Courses*
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="completedCourseInput"
                    value={formData.completedCourseInput}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Enter course (e.g. COSC 111)"
                    list="courseOptions"
                  />
                  <datalist id="courseOptions">
                    {filteredCourses.map((course) => (
                      <option key={course} value={course} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    className="px-4 py-2 bg-[#040941] text-white rounded"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.completedCourses.map((course) => (
                    <span
                      key={course}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      {course}{' '}
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(course)}
                        className="ml-1 text-red-600"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                {errors.completedCourses && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.completedCourses}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Upload Transcript*
                </label>
                <div className="flex items-center gap-3">
                  <label className="bg-[#040941] text-white px-6 py-2 rounded cursor-pointer hover:bg-[#030735]">
                    Choose File
                    <input
                      type="file"
                      name="transcriptFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.transcriptFile?.name || ''}
                    placeholder="No file chosen"
                    className="flex-1 px-3 py-2 text-green-600 bg-white"
                  />
                </div>
                {errors.transcriptFile && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.transcriptFile}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Remote Work Preference*
                </label>
                <div className="flex gap-6">
                  {(['yes','no','no-preference'] as const).map((option) => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="wantRemote"
                        value={option}
                        checked={formData.wantRemote === option}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      {option === 'no-preference'
                        ? 'No Preference'
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  ))}
                </div>
                {errors.wantRemote && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.wantRemote}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="confirmProfileUpdated"
                  checked={formData.confirmProfileUpdated}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">
                  I confirm that I have updated my profile, as it will be used
                  in the TA allocation decision process.*
                </span>
              </div>
                {errors.confirmProfileUpdated && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmProfileUpdated}
                  </p>
                )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  className="px-5 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#040941] text-white rounded hover:bg-[#030735]"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
