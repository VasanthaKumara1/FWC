'use server'

import { generateText } from 'ai'
import { z } from 'zod'

interface ResumeAnalysisResult {
  candidateName: string
  position: string
  score: number
  skills: string[]
  experience: string
  strengths: string[]
  concerns: string[]
  recommendation: 'strong-match' | 'good-match' | 'fair-match' | 'poor-match'
  summary: string
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<ResumeAnalysisResult> {
  try {
    const prompt = jobDescription
      ? `Analyze this resume against the following job description and provide a structured assessment.

Job Description:
${jobDescription}

Resume:
${resumeText}

Provide a JSON response with the following structure:
{
  "candidateName": "extracted candidate name or 'Unknown'",
  "position": "desired position from resume",
  "score": number between 0-100,
  "skills": array of technical and professional skills found,
  "experience": summary of work experience,
  "strengths": array of candidate strengths,
  "concerns": array of potential concerns or gaps,
  "recommendation": one of "strong-match", "good-match", "fair-match", "poor-match",
  "summary": brief overall assessment
}`
      : `Analyze this resume and provide a structured assessment.

Resume:
${resumeText}

Provide a JSON response with the following structure:
{
  "candidateName": "extracted candidate name or 'Unknown'",
  "position": "desired position from resume",
  "score": number between 0-100,
  "skills": array of technical and professional skills found,
  "experience": summary of work experience,
  "strengths": array of candidate strengths,
  "concerns": array of potential concerns or gaps,
  "recommendation": one of "strong-match", "good-match", "fair-match", "poor-match",
  "summary": brief overall assessment
}`

    const result = await generateText({
      model: 'google/gemini-2.0-flash',
      prompt,
      temperature: 0.3,
    })

    // Parse the response
    const textContent = result.text
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      candidateName: parsed.candidateName || 'Unknown',
      position: parsed.position || 'Not specified',
      score: Math.min(100, Math.max(0, parsed.score || 50)),
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: parsed.experience || '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      recommendation: ['strong-match', 'good-match', 'fair-match', 'poor-match'].includes(
        parsed.recommendation
      )
        ? parsed.recommendation
        : 'fair-match',
      summary: parsed.summary || '',
    }
  } catch (error) {
    console.error('Resume analysis error:', error)
    throw new Error('Failed to analyze resume. Please try again.')
  }
}

export async function bulkScreenResumes(
  resumes: Array<{ text: string; name: string }>,
  jobDescription?: string
): Promise<Array<ResumeAnalysisResult & { fileName: string }>> {
  const results = []

  for (const resume of resumes) {
    try {
      const analysis = await analyzeResume(resume.text, jobDescription)
      results.push({
        ...analysis,
        fileName: resume.name,
      })
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error analyzing resume ${resume.name}:`, error)
      results.push({
        candidateName: 'Error',
        position: 'Unknown',
        score: 0,
        skills: [],
        experience: `Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`,
        strengths: [],
        concerns: ['Analysis failed'],
        recommendation: 'poor-match',
        summary: 'Unable to process this resume',
        fileName: resume.name,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}
