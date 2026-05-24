const adminId = ObjectId("6a0c0791bd9f7696bac4c921");
const now = new Date();

const result = db.exams.insertOne({
    type: "local",
    title: "Docker Images, Containers & Dockerfile Concepts",
    description:
        "Four-question multiple-choice quiz covering core Docker concepts: the distinction between images and containers, image immutability for running containers, layer caching during builds, and why Dockerfiles are preferred over `docker commit`.",
    questions: [
        {
            id: "q_image_vs_container",
            type: "single_choice",
            prompt:
                "What is the fundamental difference between a Docker image and a Docker container?",
            points: 25,
            options: [
                {
                    id: "opt_q1_blueprint_vs_instance",
                    label:
                        "An image is a read-only, static blueprint containing the application and its environment, while a container is a live, running, and writable instance created from that image on a Docker Host.",
                    isCorrect: true,
                },
                {
                    id: "opt_q1_remote_vs_local",
                    label:
                        "An image is always stored in a remote registry such as Docker Hub, while a container is the local copy of that artifact and only exists on the developer's own machine after a successful pull.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_kernel_vs_shared",
                    label:
                        "An image bundles its own complete operating system kernel into the artifact, while a container at runtime shares the host kernel and instead provides only an isolated user-space file system.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_run_vs_build",
                    label:
                        "Images are created by running the `docker run` command against a base image on the host, while containers are produced by the `docker build` command from an existing Dockerfile in the project.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_no_difference",
                    label:
                        "There is no significant technical difference between the two concepts; the terms image and container are used interchangeably in the Docker ecosystem to refer to the same packaged application artifact.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_running_container_image_immutable",
            type: "single_choice",
            prompt:
                "A developer has a running container named `blue-server` which was started from the image `my-app:blue`. The developer then makes a code change, rebuilds the image, and applies the same tag `my-app:blue` to the new version. What happens to the running `blue-server` container?",
            points: 25,
            options: [
                {
                    id: "opt_q2_hot_swap",
                    label:
                        "The code inside the running `blue-server` container is hot-swapped and updated to the new version automatically by the Docker daemon, without any need to restart the container on the host.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_auto_restart",
                    label:
                        "The `blue-server` container automatically stops itself and then restarts using the freshly rebuilt image, so the running container immediately picks up the latest code change on the host.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_immutable_link",
                    label:
                        "The `blue-server` container continues to run the *original* version of the code, completely unaffected by the new image build. Containers are linked to a specific image ID, not a mutable tag.",
                    isCorrect: true,
                },
                {
                    id: "opt_q2_crash",
                    label:
                        "The `blue-server` container will crash because the image it was originally based on has now been replaced, leaving the running process without a valid backing artifact in the local cache.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_tag_renamed",
                    label:
                        "The running container's image tag automatically renames itself to `my-app:blue_old` to avoid any conflict, while the freshly rebuilt artifact takes over the original `my-app:blue` tag.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_dockerfile_layer_caching",
            type: "single_choice",
            prompt:
                "Each instruction in a Dockerfile (like `FROM`, `RUN`, `COPY`) creates a new layer in the final image. How does Docker leverage this layered architecture to speed up subsequent image builds?",
            points: 25,
            options: [
                {
                    id: "opt_q3_no_impact",
                    label:
                        "The layered architecture is only used to logically organize the image and has no measurable impact on build speed; rebuilds always re-execute every single instruction from scratch on the host.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_parallel_cpu",
                    label:
                        "It runs all instructions in the Dockerfile in parallel, using a separate dedicated CPU core for each layer, so that the total build time is bounded by the slowest individual instruction in the file.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_flatten_first",
                    label:
                        "It combines all of the declared layers into a single flattened layer before the build actually begins, which is significantly faster to process than executing each instruction in turn.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_pre_download",
                    label:
                        "Docker pre-downloads every possible layer from Docker Hub before the build starts on the host, so subsequent builds can reuse those preloaded layers instead of executing the instructions locally.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_layer_cache",
                    label:
                        "Docker caches the result (the intermediate image layer) of each instruction. If an instruction and its inputs have not changed since a previous build, Docker reuses the cached layer instead of re-executing the instruction.",
                    isCorrect: true,
                },
            ],
        },
        {
            id: "q_dockerfile_vs_commit",
            type: "single_choice",
            prompt:
                "Why is using a Dockerfile considered the standard and best practice for creating Docker images, as opposed to creating an image from a running container using `docker commit`?",
            points: 25,
            options: [
                {
                    id: "opt_q4_recipe_reproducible",
                    label:
                        "A Dockerfile provides a clear, version-controlled, and reproducible \"recipe\" for building the image. It documents the entire process and allows for easy automation in CI/CD pipelines on any host.",
                    isCorrect: true,
                },
                {
                    id: "opt_q4_commit_larger",
                    label:
                        "`docker commit` produces images that are technically much larger than those created from a Dockerfile build, because it always bundles the full container filesystem instead of a layered representation.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_cannot_push",
                    label:
                        "Images that are created with the `docker commit` command cannot be pushed to any container registry, including private ones, because they lack the manifest format expected by registry servers.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_deprecated",
                    label:
                        "`docker commit` is officially a deprecated command and will be removed in future versions of Docker, so any image-creation workflow that relies on it will eventually stop working on new releases.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_faster",
                    label:
                        "Using a Dockerfile is significantly faster end-to-end than using `docker commit`, because the build engine is heavily optimised for this path while the commit code path is intentionally throttled.",
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
