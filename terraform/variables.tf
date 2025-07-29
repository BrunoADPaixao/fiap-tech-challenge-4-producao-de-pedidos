variable "aws_region" {
  description = "A região da AWS para criar os recursos."
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "O nome do projeto, usado para nomear recursos."
  type        = string
  default     = "microsservico-producao"
}

variable "mongo_uri" {
  description = "A string de conexão para o MongoDB Atlas."
  type        = string
  sensitive   = true # Marca como sensível para não exibir nos logs.
}