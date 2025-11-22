'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CompanyContext {
  companyName: string;
  industry: string;
  companySize: string;
  position: string;
  department: string;
  experienceLevel: string;
  keySkills: string;
  companyValues: string;
  interviewFocus: string;
  additionalContext: string;
}

export default function AdminPanel() {
  const [context, setContext] = useState<CompanyContext>({
    companyName: '',
    industry: '',
    companySize: '',
    position: '',
    department: '',
    experienceLevel: '',
    keySkills: '',
    companyValues: '',
    interviewFocus: '',
    additionalContext: '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContext((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    // For now, just store in localStorage
    localStorage.setItem('companyContext', JSON.stringify(context));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('companyContext');
    if (saved) {
      setContext(JSON.parse(saved));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-neutral-600">
              Configure company context for interview question generation
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            Back to Interview
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <div className="space-y-6">
            {/* Company Information */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={context.companyName}
                    onChange={handleChange}
                    placeholder="e.g., Acme Corp"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={context.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="companySize"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={context.companySize}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={context.department}
                    onChange={handleChange}
                    placeholder="e.g., Engineering, Sales, Marketing"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Position Details */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Position Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Position Title
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={context.position}
                    onChange={handleChange}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="experienceLevel"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={context.experienceLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="keySkills"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Key Skills Required
                </label>
                <textarea
                  id="keySkills"
                  name="keySkills"
                  value={context.keySkills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, TypeScript, System Design, Communication"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Interview Configuration */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Interview Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="companyValues"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Company Values
                  </label>
                  <textarea
                    id="companyValues"
                    name="companyValues"
                    value={context.companyValues}
                    onChange={handleChange}
                    placeholder="e.g., Innovation, Transparency, Customer-First, Collaboration"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="interviewFocus"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Interview Focus Areas
                  </label>
                  <textarea
                    id="interviewFocus"
                    name="interviewFocus"
                    value={context.interviewFocus}
                    onChange={handleChange}
                    placeholder="e.g., Technical depth, Problem-solving, Cultural fit, Leadership"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="additionalContext"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Additional Context
                  </label>
                  <textarea
                    id="additionalContext"
                    name="additionalContext"
                    value={context.additionalContext}
                    onChange={handleChange}
                    placeholder="Any additional information that would help generate better interview questions..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-neutral-200">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Save Context
            </button>
            <button
              onClick={handleLoad}
              className="px-6 py-2.5 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
            >
              Load Saved
            </button>
            {isSaved && (
              <span className="text-sm text-green-600 ml-2">
                Context saved successfully
              </span>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            Context Preview
          </h3>
          <pre className="text-xs font-jetbrains text-neutral-600 bg-neutral-50 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(context, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
