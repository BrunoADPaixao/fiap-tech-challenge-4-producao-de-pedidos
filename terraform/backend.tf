terraform {
  backend "s3" {
    bucket = "tfstate-seu-nome-microsservico-producao"

    key = "producao/terraform.tfstate"
    
    region = "us-east-2" # Mude se sua região for outra
  }
}
