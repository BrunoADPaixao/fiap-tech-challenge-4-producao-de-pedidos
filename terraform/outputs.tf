output "ecr_repository_url" {
  description = "A URL do repositório ECR criado."
  value       = aws_ecr_repository.app_ecr_repo.repository_url
}

output "ecs_cluster_name" {
  description = "O nome do cluster ECS."
  value       = aws_ecs_cluster.app_cluster.name
}

output "ecs_service_name" {
  description = "O nome do serviço ECS."
  value       = aws_ecs_service.app_service.name
}
