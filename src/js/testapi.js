const api = {
    async getServices() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: "Développement Web", icon: "code-slash", description: "Création de sites modernes et applications web performantes." },
                    { id: 2, name: "Design UI/UX", icon: "palette", description: "Design d'interfaces utilisateur intuitives et esthétiques." },
                    { id: 3, name: "Optimisation SEO", icon: "search", description: "Amélioration de votre visibilité dans les moteurs de recherche." },
                    { id: 4, name: "Maintenance", icon: "wrench", description: "Support technique et maintenance continue de vos applications." }
                ]);
            }, 800);
        });
    },
    
    async getTeamMembers() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: "Alex Martin", role: "Développeur Fullstack", bio: "Expert en JavaScript avec 8 ans d'expérience." },
                    { id: 2, name: "Sophie Dubois", role: "Designer UI/UX", bio: "Spécialiste en design d'interface et expérience utilisateur." },
                    { id: 3, name: "Thomas Bernard", role: "DevOps", bio: "Architecture cloud et déploiement continu." }
                ]);
            }, 600);
        });
    }
};

// Export de l'API pour utilisation dans d'autres modules
export { api };