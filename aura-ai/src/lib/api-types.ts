/**
 * Semantic Video Search Result Interface.
 * Defines the structure for search results returned by the inference engine,
 * including similarity scores for ranking and relevance.
 */
export interface SearchResponse {
  results: Array<{
    id: string
    title: string
    file_url: string
    category_id?: string
    similarity: number
  }>
}

/**
 * Search Query Payload Interface.
 * Specifies the parameters for vector-based semantic search operations,
 * allowing for control over match thresholds and result counts.
 */
export interface SearchQuery {
  query: string
  match_threshold?: number
  match_count?: number
}

/**
 * Recommendation Response Interface.
 * Structure for context-aware content suggestions derived from current playback state.
 */
export interface RecommendResponse {
  recommendations: Array<{
    id: string
    title: string
    file_url: string
    category_id?: string
  }>
}