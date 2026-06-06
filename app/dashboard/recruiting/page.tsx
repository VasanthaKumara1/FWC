'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { analyzeResume, bulkScreenResumes } from '@/app/actions/resume-screening'

interface AnalysisResult {
  candidateName: string
  position: string
  score: number
  skills: string[]
  experience: string
  strengths: string[]
  concerns: string[]
  recommendation: 'strong-match' | 'good-match' | 'fair-match' | 'poor-match'
  summary: string
  fileName?: string
}

export default function RecruitingPage() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')

  const handleAnalyzeSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeText.trim()) {
      setError('Please enter resume text')
      return
    }

    try {
      setLoading(true)
      setError('')
      const result = await analyzeResume(resumeText, jobDescription)
      setAnalysisResults([result])
      setResumeText('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyze resume'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleBulkAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one resume')
      return
    }

    try {
      setLoading(true)
      setError('')

      const resumesData = await Promise.all(
        uploadedFiles.map(async (file) => ({
          text: await file.text(),
          name: file.name,
        }))
      )

      const results = await bulkScreenResumes(resumesData, jobDescription)
      setAnalysisResults(results)
      setUploadedFiles([])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyze resumes'
      )
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-match':
        return 'bg-green-100 text-green-800'
      case 'good-match':
        return 'bg-blue-100 text-blue-800'
      case 'fair-match':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor-match':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Resume Screening
          </h1>
          <p className="text-gray-600">
            Analyze resumes with AI-powered screening
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => {
              setActiveTab('single')
              setAnalysisResults([])
            }}
            className={`${
              activeTab === 'single'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            Single Resume
          </Button>
          <Button
            onClick={() => {
              setActiveTab('bulk')
              setAnalysisResults([])
            }}
            className={`${
              activeTab === 'bulk'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            Bulk Upload
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Single Resume Tab */}
        {activeTab === 'single' && (
          <Card className="mb-6 p-6">
            <form onSubmit={handleAnalyzeSingle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for better matching..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste the resume text here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </form>
          </Card>
        )}

        {/* Bulk Upload Tab */}
        {activeTab === 'bulk' && (
          <Card className="mb-6 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for better matching..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resumes (Text Files)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Click to upload files
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    or drag and drop
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files ({uploadedFiles.length}):
                    </p>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600">
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            onClick={() => {
                              setUploadedFiles((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }}
                            className="text-xs bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                onClick={handleBulkAnalysis}
                disabled={loading || uploadedFiles.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Analyzing...' : 'Analyze All Resumes'}
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {analysisResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Results</h2>

            {analysisResults.map((result, idx) => (
              <Card key={idx} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {result.candidateName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Position: {result.position}
                      </p>
                      {result.fileName && (
                        <p className="text-xs text-gray-500 mt-1">
                          {result.fileName}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getRecommendationColor(result.recommendation)}`}
                      >
                        {result.recommendation.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{result.summary}</p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Experience
                    </h4>
                    <p className="text-sm text-gray-700">{result.experience}</p>
                  </div>

                  {/* Skills */}
                  {result.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths and Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {result.strengths.map((strength, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="text-green-600 mr-2">✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.concerns.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">
                          Concerns
                        </h4>
                        <ul className="space-y-1">
                          {result.concerns.map((concern, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="text-red-600 mr-2">!</span>
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            <Button
              onClick={() => setAnalysisResults([])}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Clear Results
            </Button>
          </div>
        )}

        {analysisResults.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              {activeTab === 'single'
                ? 'Paste a resume above to start analyzing'
                : 'Upload resumes to start bulk screening'}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
