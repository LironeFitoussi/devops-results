const examId = ObjectId("6a12e20a24d3b40e94abc114");

const newQuestion = {
    id: "q_docker_component_lifecycle",
    type: "single_choice",
    prompt:
        "Which of the three main Docker components is primarily responsible for managing the lifecycle of containers (starting, stopping, etc.) and managing images (pulling, storing, removing)?",
    points: 20,
    options: [
        {
            id: "opt_q6_registry",
            label:
                "The Image Registry (for example Docker Hub), which exposes an HTTP API that hosts manage container state and image storage against on the local Docker Host.",
            isCorrect: false,
        },
        {
            id: "opt_q6_client",
            label:
                "The Docker Client (the `docker` CLI), which is the long-running background process that owns container lifecycle and image storage on the Docker Host itself.",
            isCorrect: false,
        },
        {
            id: "opt_q6_daemon",
            label:
                "The Docker Daemon (also called the Docker Engine), the long-running background process on the Docker Host that manages container lifecycle and the local image store.",
            isCorrect: true,
        },
        {
            id: "opt_q6_dockerfile",
            label:
                "The Dockerfile, which is loaded into memory at runtime and from there orchestrates container start, stop, image pull, and image removal operations on the Docker Host.",
            isCorrect: false,
        },
        {
            id: "opt_q6_hypervisor",
            label:
                "The Hypervisor underneath the Docker Host, which is the component that actually owns container lifecycle management and image storage in any Docker-based environment.",
            isCorrect: false,
        },
    ],
};

const result = db.exams.updateOne(
    { _id: examId, type: "local" },
    {
        $push: { questions: newQuestion },
        $set: { totalPoints: 120, updatedAt: new Date() },
    },
);

print(JSON.stringify(result));
