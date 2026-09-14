import { apiRequest } from "@/lib/api";

export interface BackendRepository {
  id: string;
  user_id: string;
  provider: string;
  external_repo_id: string;
  name: string;
  full_name: string;
  url: string;
  default_branch: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRepositoryRequest {
  provider: string;
  external_repo_id: string;
  name: string;
  full_name: string;
  url: string;
  default_branch: string;
  is_private: boolean;
}

export async function getRepositories(): Promise<BackendRepository[]> {
  return apiRequest<BackendRepository[]>("/repositories");
}

export async function createRepository(
  repository: CreateRepositoryRequest
): Promise<BackendRepository> {
  return apiRequest<BackendRepository>("/repositories", {
    method: "POST",
    body: JSON.stringify(repository),
  });
}

export async function deleteRepository(id: string): Promise<void> {
  await apiRequest(`/repositories/${id}`, {
    method: "DELETE",
  });
}