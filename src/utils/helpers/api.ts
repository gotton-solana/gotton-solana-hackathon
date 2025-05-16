import axios from 'axios';
import axiosRetry from 'axios-retry';

/**
 * Makes an HTTP GET request to the provided URL with optional configurations.
 *
 * @param url - The URL to send the GET request to.
 * @param config - Optional configuration object for parameters, headers, and timeout.
 * @returns The data from the response.
 * @throws Will throw an error if the request fails.
 */
export async function get(
  url: string,
  config?: {
    params?: object; // Query parameters to be sent in the request
    headers?: object; // Headers to be included in the request
    timeout?: number; // Timeout duration in milliseconds
  },
) {
  try {
    const response = await axios.get(url, {
      params: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Makes a POST request with retry logic, attempting the request multiple times in case of failure.
 *
 * @param url - The URL to send the POST request to.
 * @param data - The data to be sent in the body of the POST request.
 * @param retries - The number of retries to attempt in case of failure.
 * @param timeout - The timeout duration for each request.
 * @param config - Optional configuration object for headers.
 * @returns The data from the response after a successful POST.
 * @throws Will log and handle the error if all retry attempts fail.
 */
export async function postWithRetry(
  url: string,
  data: object,
  retries: number,
  timeout: number,
  config?: {
    headers?: object;
  },
) {
  // Configure axios to automatically retry the request in case of failure
  axiosRetry(axios, {
    retries,
    retryDelay: () => {
      return timeout;
    },
    retryCondition: () => true,
    shouldResetTimeout: true,
    onRetry(retryCount) {
      console.log(`Retry count ${retryCount}`);
    },
  });

  try {
    const response = await axios.post(url, data, {
      headers: config?.headers,
      timeout,
    });
    return response.data;
  } catch (error) {
    console.error('Error POST:', error);
  }
}
