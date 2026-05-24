const adminId = ObjectId("6a0c0791bd9f7696bac4c921");
const now = new Date();

const result = db.exams.insertOne({
    type: "local",
    title: "Containers & Docker Fundamentals",
    description:
        "Five-question multiple-choice quiz covering containerization concepts, Docker workflows, image distribution, host-kernel sharing, and registries.",
    questions: [
        {
            id: "q_container_dependency_isolation",
            type: "single_choice",
            prompt:
                "A development team is struggling with the \"it works on my machine\" problem, where an application runs perfectly on a developer's laptop but fails in the testing environment due to differences in library versions and system configuration. How does containerization primarily solve this issue?",
            points: 20,
            options: [
                {
                    id: "opt_q1_hypervisor",
                    label:
                        "By providing a hypervisor that translates system calls between different host operating systems, allowing the same binary to run unmodified anywhere it lands.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_bundle_image",
                    label:
                        "By bundling the application with all its specific dependencies, libraries, and configurations into a single, immutable container image, so the environment is identical wherever the container is run.",
                    isCorrect: true,
                },
                {
                    id: "opt_q1_auto_update",
                    label:
                        "By automatically updating every dependency to its latest version during deployment, so each developer and server always converges on a single shared software baseline.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_full_vm",
                    label:
                        "By creating a full, dedicated virtual machine for each developer at build time, so their personal environments stay completely isolated from one another at runtime.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_same_hardware",
                    label:
                        "By requiring all developers, testers, and production servers to standardise on the exact same CPU, memory, and disk hardware, eliminating any machine-level variation.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_microservice_runtime_choice",
            type: "single_choice",
            prompt:
                "You need to deploy a new microservice-based, cloud-native application. The key requirements are rapid scalability, high resource efficiency (running as many instances as possible on the hardware), and fast startup times. In this scenario, what is the most appropriate technology to use and why?",
            points: 20,
            options: [
                {
                    id: "opt_q2_vm_portable",
                    label:
                        "Virtual Machines, because they are generally more portable across clouds than containers and therefore better suited to rapid horizontal scaling of stateless services.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_vm_security",
                    label:
                        "Virtual Machines, because they offer the strongest possible security isolation between services and that hardening outweighs any density or startup-time concerns.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_containers",
                    label:
                        "Containers, because they are lightweight, share the host OS kernel, have minimal overhead, and can be started in seconds, making them ideal for scaling many microservices efficiently.",
                    isCorrect: true,
                },
                {
                    id: "opt_q2_containers_guest",
                    label:
                        "Containers, because each one includes its own complete guest operating system, which gives every microservice the dedicated kernel resources it needs to scale.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_hybrid",
                    label:
                        "A hybrid approach, running each microservice on a separate dedicated physical server for maximum raw performance, then load-balancing across them at the network edge.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_docker_run_first_time_flow",
            type: "single_choice",
            prompt:
                "A developer runs the command `docker run nginx` on their machine for the very first time. The nginx image is not present locally. Which of the following sequences of events correctly describes what happens behind the scenes?",
            points: 20,
            options: [
                {
                    id: "opt_q3_correct_flow",
                    label:
                        "The Docker Client sends the command to the Docker Daemon on the host; the Daemon checks its local image cache, does not find nginx, pulls the image from a public registry like Docker Hub, caches it locally, and starts a new container based on that image.",
                    isCorrect: true,
                },
                {
                    id: "opt_q3_client_downloads",
                    label:
                        "The Docker Client itself downloads the nginx image directly from the public internet over HTTPS, stores the layers in its own user cache, and then instructs the Docker Daemon to start the container from that cached copy.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_empty_install",
                    label:
                        "The Docker Daemon creates an empty container based on a generic base image, installs Nginx into it from scratch using the host's package manager, and then commits the result as a new local image before starting it up.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_must_build",
                    label:
                        "The command fails immediately because the nginx image must first be built locally using `docker build` from an official Dockerfile before any `docker run` command targeting that image name can succeed on this host.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_registry_pushes",
                    label:
                        "The Docker Client sends the run command straight to the image registry, which then packages the image into a container on its side and pushes that container directly to the Docker Host to execute.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_container_kernel_misconception",
            type: "single_choice",
            prompt:
                "A developer makes the following statement: \"Containers are great because they are completely independent of the host machine. I can take a container running on a Linux server and run it directly on a Windows server without any issues because the container includes its own Linux guest OS.\" What is the fundamental misconception in this statement?",
            points: 20,
            options: [
                {
                    id: "opt_q4_statement_correct",
                    label:
                        "The statement is essentially correct; this is exactly how containers work and any modern Docker host can transparently run any container image regardless of the underlying operating system kernel.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_less_portable",
                    label:
                        "The real misconception is portability: containers are actually less portable than Virtual Machines because they are tightly bound to a specific CPU architecture and cannot move between hosts easily.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_no_windows_docker",
                    label:
                        "The misconception is about platform support: Windows servers cannot run Docker at all, so any plan that involves moving a container onto a Windows host is fundamentally impossible from the start.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_docker_push",
                    label:
                        "The developer should have used the `docker push` command first to move the container itself from the Linux host to the Windows host, after which the container would run natively on Windows without changes.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_share_kernel",
                    label:
                        "Containers do not include their own guest OS; they share the kernel of the host operating system. A standard Linux container therefore cannot run natively on a Windows kernel and needs a compatibility layer such as WSL2 to provide a Linux kernel.",
                    isCorrect: true,
                },
            ],
        },
        {
            id: "q_image_distribution_registry",
            type: "single_choice",
            prompt:
                "A developer has just written a Dockerfile for their new application. They run `docker build -t my-app:1.0 .` and it completes successfully. A colleague on a different machine then tries to run `docker run my-app:1.0` but gets an \"image not found\" error. What crucial step was missed in the workflow?",
            points: 20,
            options: [
                {
                    id: "opt_q5_daemon_off",
                    label:
                        "The colleague's Docker Daemon is not currently running on their machine, so any `docker run` command will fail with an image-not-found style error until the Docker service itself is started up again.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_wrong_tag",
                    label:
                        "The original `docker build` command was run with the wrong tag format; it should have been `-t my-app/1.0` using a slash, otherwise the resulting image cannot be located by a `docker run` on any other host.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_pull_first",
                    label:
                        "The colleague simply needs to run `docker pull my-app:1.0` before running it, which will fetch the image automatically from the default registry that Docker is preconfigured to look at.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_never_pushed",
                    label:
                        "The developer who built the image never pushed it to a shared image registry. The `docker build` command only creates the image in the local cache of their own Docker Host, so other machines cannot find it.",
                    isCorrect: true,
                },
                {
                    id: "opt_q5_copy_dockerfile",
                    label:
                        "The Dockerfile itself must be copied over to the colleague's machine so they can build the image locally themselves, because Docker images are not designed to be transferred between developer workstations.",
                    isCorrect: false,
                },
            ],
        },
    ],
    totalPoints: 100,
    assignedStudents: [],
    status: "draft",
    createdBy: adminId,
    createdAt: now,
    updatedAt: now,
});

print(JSON.stringify({ insertedId: result.insertedId }));
