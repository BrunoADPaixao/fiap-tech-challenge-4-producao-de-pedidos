# Define o provedor que vamos usar (AWS) e a região.
provider "aws" {
  region = var.aws_region
}

# Configura o backend do Terraform para salvar o estado remotamente no S3.
# É uma boa prática para trabalho em equipe, mas opcional para começar.
# Por enquanto, vamos manter o estado localmente.

# Cria o repositório ECR para armazenar nossa imagem Docker.
resource "aws_ecr_repository" "app_ecr_repo" {
  name = "${var.project_name}-repo"
}

# Cria o cluster ECS onde nossa aplicação vai rodar.
resource "aws_ecs_cluster" "app_cluster" {
  name = "${var.project_name}-cluster"
}

# Define a "receita" do nosso contêiner (Task Definition).
resource "aws_ecs_task_definition" "app_task" {
  family                   = "${var.project_name}-task"
  network_mode             = "awsvpc" # Modo de rede necessário para o Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"  # 256 CPU units (.25 vCPU)
  memory                   = "512"  # 512MB de memória

  # O papel que a AWS usa para executar a tarefa (puxar imagem, etc.)
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  # A definição do nosso contêiner principal.
  container_definitions = jsonencode([
    {
      name      = var.project_name
      # A imagem será preenchida pela nossa pipeline de CI/CD.
      image     = "${aws_ecr_repository.app_ecr_repo.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3002
          hostPort      = 3002
        }
      ]
      # Passa a string de conexão do MongoDB como um segredo.
      environment = [
        {
          name  = "MONGO_URI"
          value = var.mongo_uri
        }
      ]
      # Configuração de logs para o CloudWatch.
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Cria o serviço ECS, que mantém nossa tarefa rodando.
resource "aws_ecs_service" "app_service" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1 # Queremos 1 instância da nossa aplicação rodando.

  network_configuration {
    subnets         = ["subnet-057d3d09d90f8e6dc", "subnet-072ef32aadde657b4"]
    security_groups = [aws_security_group.ecs_service_sg.id]
    assign_public_ip = true # Atribui um IP público para acesso inicial.
  }
}

# --- Recursos de Segurança e Permissões ---

# Grupo de segurança que permite tráfego na porta 3002.
resource "aws_security_group" "ecs_service_sg" {
  name        = "${var.project_name}-sg"
  description = "Permite trafego HTTP para o servico ECS"
  vpc_id      = "vpc-008fbe2f3487ca84a"

  ingress {
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Permite acesso de qualquer lugar (para teste).
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Papel IAM que o ECS precisa para executar tarefas.
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# Anexa a política gerenciada pela AWS ao papel.
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Cria o grupo de logs no CloudWatch.
resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name = "/ecs/${var.project_name}"
}
