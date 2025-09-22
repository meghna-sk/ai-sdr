import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface EvaluationResult {
  lead_id: string
  actual_verdict: string
  expected_verdict: string
  actual_confidence: number
  expected_confidence_range: [number, number]
  verdict_match: boolean
  confidence_in_range: boolean
  overall_pass: boolean
  reasoning: string
  schema_valid: boolean
  schema_errors: string[]
  error: string | null
}

interface EvaluationRun {
  evaluation_id: number
  timestamp: string
  status: string
  total_tests: number
  passed_tests: number
  failed_tests: number
  error_tests: number
  pass_rate: number
  verdict_accuracy: number
  confidence_accuracy: number
  schema_compliance_rate: number
  total_schema_errors: number
  avg_prompt_completeness: number
  results: EvaluationResult[]
}

interface RunEvaluationRequest {
  include_leads?: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Fetch all evaluations
const fetchEvaluations = async (): Promise<EvaluationRun[]> => {
  const response = await fetch(`${API_BASE_URL}/api/evals/`)
  if (!response.ok) {
    throw new Error('Failed to fetch evaluations')
  }
  return response.json()
}

// Fetch specific evaluation
const fetchEvaluation = async (id: number): Promise<EvaluationRun> => {
  const response = await fetch(`${API_BASE_URL}/api/evals/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch evaluation')
  }
  return response.json()
}

// Run new evaluation
const runEvaluation = async (request: RunEvaluationRequest = {}): Promise<EvaluationRun> => {
  const response = await fetch(`${API_BASE_URL}/api/evals/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    throw new Error('Failed to run evaluation')
  }
  
  return response.json()
}

// Hook to fetch all evaluations
export const useEvaluations = () => {
  return useQuery({
    queryKey: ['evaluations'],
    queryFn: fetchEvaluations,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new evaluations
  })
}

// Hook to fetch specific evaluation
export const useEvaluation = (id: number) => {
  return useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => fetchEvaluation(id),
    enabled: !!id,
  })
}

// Hook to run new evaluation
export const useRunEvaluation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: runEvaluation,
    onSuccess: () => {
      // Invalidate and refetch evaluations list
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}

export type { EvaluationRun, EvaluationResult, RunEvaluationRequest }
