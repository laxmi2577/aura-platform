/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnalysisRequest } from '../models/AnalysisRequest';
import type { FindSimilarRequest } from '../models/FindSimilarRequest';
import type { MixRequest } from '../models/MixRequest';
import type { RecommendRequest } from '../models/RecommendRequest';
import type { SearchQuery } from '../models/SearchQuery';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Search Sounds
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchSoundsSearchPost(
        requestBody: SearchQuery,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Analyze Audio
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static analyzeAudioAnalyzeWaveformPost(
        requestBody: AnalysisRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/analyze-waveform',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Classify Audio
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static classifyAudioClassifyAudioPost(
        requestBody: AnalysisRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/classify-audio',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Classify Custom
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static classifyCustomClassifyCustomPost(
        requestBody: AnalysisRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/classify-custom',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Recommendations
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getRecommendationsRecommendPost(
        requestBody: RecommendRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/recommend',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Find Similar
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static findSimilarFindSimilarPost(
        requestBody: FindSimilarRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/find-similar',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Force Retrain
     * @returns any Successful Response
     * @throws ApiError
     */
    public static forceRetrainAdminRetrainPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/retrain',
        });
    }
    /**
     * Generate Mix
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateMixGenerateMixPost(
        requestBody: MixRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/generate-mix',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Root
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readRootGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
}
