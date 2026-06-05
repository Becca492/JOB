namespace JobPost.Models
{
    public class User
    {
        public int Id { get; set; }

        // Identité
        public string Prenom { get; set; } = "";
        public string Nom { get; set; } = "";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";

        // Compte
        public string Role { get; set; } = "candidat";

        // Coordonnées
        public string? Telephone { get; set; }
        public string? Ville { get; set; }
        public string? Pays { get; set; }

        // Profession
        public string? Poste { get; set; }
        public string? Secteur { get; set; }
        public string? Disponibilite { get; set; }

        // Formation
        public string? NiveauEtude { get; set; }

        // Salaire
        public string? PretentionSalariale { get; set; }

        // Expérience
        public int Experience { get; set; }

        // Compétences
       public string Skills { get; set; }

        // Présentation
        public string? Bio { get; set; }

        // CV
        public string? CvFilePath { get; set; }

        // Date création
        public DateTime DateCreation { get; set; } = DateTime.Now;
    }
}