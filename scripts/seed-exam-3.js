const adminId = ObjectId("6a0c0791bd9f7696bac4c921");
const now = new Date();

const result = db.exams.insertOne({
    type: "local",
    title: "Docker Images, Tags & Registries",
    description:
        "Six-question multiple-choice quiz covering Docker image fundamentals: version pinning vs `latest`, private registries, image IDs vs tags, registry authentication, image definition, and pushing to Docker Hub.",
    questions: [
        {
            id: "q_pin_base_image_version",
            type: "single_choice",
            prompt:
                "When defining a base image in a Dockerfile for a production application, why is it considered a critical best practice to pin to a specific version tag (e.g. `node:20.11.1-alpine`) instead of using the `latest` tag?",
            points: 20,
            options: [
                {
                    id: "opt_q1_latest_insecure",
                    label:
                        "The `latest` tag is always the least secure version of any image because public registries deliberately exclude security patches from whatever they publish under that particular floating tag.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_smaller_size",
                    label:
                        "Pinning to a specific version tag results in significantly smaller final image sizes than using `latest`, because the registry serves a stripped-down variant once a precise version is requested by the client.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_moving_pointer",
                    label:
                        "The `latest` tag is a moving pointer that changes whenever a new image is published; pinning to a specific version ensures that builds are reproducible and prevents the application from breaking unexpectedly due to unvetted changes in the base image.",
                    isCorrect: true,
                },
                {
                    id: "opt_q1_hub_charges",
                    label:
                        "Docker Hub charges extra bandwidth fees for pulling images that use the `latest` tag, so production builds normally pin to a specific version tag to keep the team's monthly registry costs predictable.",
                    isCorrect: false,
                },
                {
                    id: "opt_q1_build_fails",
                    label:
                        "A Dockerfile will not actually build successfully if its `FROM` line uses the `latest` tag; the Docker daemon explicitly requires a specific version in that field before it will accept the build instructions.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_private_registry_purpose",
            type: "single_choice",
            prompt:
                "What is the primary purpose of using a private container registry (like AWS ECR, Google Artifact Registry, or a self-hosted one) in a corporate environment?",
            points: 20,
            options: [
                {
                    id: "opt_q2_faster_downloads",
                    label:
                        "Private registries offer significantly faster image download speeds than public ones such as Docker Hub, because corporate networks are wired to bypass the public CDN paths used by community registries.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_secure_proprietary",
                    label:
                        "To securely store and distribute proprietary, company-specific Docker images that contain sensitive application code, with granular access control to ensure only authorized users and systems can pull or push them.",
                    isCorrect: true,
                },
                {
                    id: "opt_q2_only_way_to_tag",
                    label:
                        "It is the only supported way to apply meaningful version tags to Docker images in an enterprise setting; public registries strip custom tags off any image that is uploaded by a non-individual account.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_free_vs_paid",
                    label:
                        "Private registries are completely free to use for any sized organisation, unlike public registries such as Docker Hub, which charge monthly subscription fees for every image stored in a corporate account.",
                    isCorrect: false,
                },
                {
                    id: "opt_q2_official_images",
                    label:
                        "To gain access to the curated set of \"Docker Official Images,\" which are deliberately reserved for paying enterprise customers and can only be pulled through a configured private registry mirror.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_tags_alias_same_image_id",
            type: "single_choice",
            prompt:
                "A developer runs `docker images` and sees the following output. They are confused because two different tags (`24.04` and `latest`) point to the same IMAGE ID `a2b15746f597` on the `ubuntu` repository, while a third row `ubuntu:22.04` has a different IMAGE ID `1a8a88147777`. What is the correct explanation for this?",
            points: 20,
            options: [
                {
                    id: "opt_q3_linux_vs_windows",
                    label:
                        "One tag (`24.04`) represents the Linux variant of the image, while the other (`latest`) represents the Windows variant; Docker stores both under the same IMAGE ID because they share most of their underlying layers.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_corrupted_cache",
                    label:
                        "This indicates a corrupted local image cache where two tags have been incorrectly merged onto the same IMAGE ID; the developer should run `docker system prune` in order to clear the duplicated entries.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_dev_vs_prod",
                    label:
                        "The `latest` tag is intended for development use while the `24.04` tag is intended for production use; the registry compiles both from the same source so they are functionally identical at runtime.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_base_vs_child",
                    label:
                        "One of the images is a base image, and the other is a child image derived from it that has not yet been modified; because nothing has changed, both currently share the same IMAGE ID on disk.",
                    isCorrect: false,
                },
                {
                    id: "opt_q3_tags_are_aliases",
                    label:
                        "An image is uniquely defined by its IMAGE ID (or digest). Multiple tags are simply human-readable pointers or aliases that can refer to the exact same image; in this case `latest` is an alias for the `24.04` image.",
                    isCorrect: true,
                },
            ],
        },
        {
            id: "q_private_registry_auth",
            type: "single_choice",
            prompt:
                "A developer is trying to download a proprietary image from their company's private registry by running `docker pull my-company.com/app:v2.1`. The command fails with an authentication error or \"image not found\" message. What is the most likely step they missed?",
            points: 20,
            options: [
                {
                    id: "opt_q4_use_import",
                    label:
                        "The correct command to download an image from a private registry is `docker import`, not `docker pull`; `docker pull` is only wired to work against the public Docker Hub registry under the default configuration.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_tag_invalid",
                    label:
                        "The image tag `v2.1` is invalid because Docker tags cannot contain periods; the developer should re-tag the image without dots before any private registry will agree to serve it back to the client.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_use_search",
                    label:
                        "They must use the `docker search` command to locate the image in the private registry first; only after that lookup succeeds will Docker know enough about the artifact to be able to actually pull it.",
                    isCorrect: false,
                },
                {
                    id: "opt_q4_docker_login",
                    label:
                        "They did not authenticate with the private registry first using the `docker login my-company.com` command with their credentials; without that login step the registry refuses to serve the image to the client.",
                    isCorrect: true,
                },
                {
                    id: "opt_q4_firewall_block",
                    label:
                        "The company's corporate firewall is silently blocking the connection out to the private registry's hostname, so the Docker client falls back to a generic authentication error or image-not-found message.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_image_definition",
            type: "single_choice",
            prompt: "What is the fundamental definition of a Docker image?",
            points: 20,
            options: [
                {
                    id: "opt_q5_readonly_template",
                    label:
                        "A read-only, inert template composed of a stack of filesystem layers. It contains everything needed to run an application: a base OS filesystem, runtimes, libraries, dependencies, and the application code itself.",
                    isCorrect: true,
                },
                {
                    id: "opt_q5_running_instance",
                    label:
                        "A running instance of an application that is isolated from the host system, with its own process space and a writable top layer that persists changes made by the application during its lifetime.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_text_instructions",
                    label:
                        "A text file containing a set of build instructions, such as `FROM`, `RUN`, and `COPY`, that Docker uses to automate the creation of an application environment whenever a build is executed on the host.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_lightweight_vm",
                    label:
                        "A lightweight virtual machine that includes its own guest operating system kernel and a virtualized hardware layer, which together give the application process a dedicated execution environment.",
                    isCorrect: false,
                },
                {
                    id: "opt_q5_backup_snapshot",
                    label:
                        "A backup snapshot of a previously running container that can be restored on demand and used as the primary mechanism for application-level disaster recovery in a Docker-based environment.",
                    isCorrect: false,
                },
            ],
        },
        {
            id: "q_docker_hub_push_namespace",
            type: "single_choice",
            prompt:
                "A developer has an account on Docker Hub with the username `testuser`. They build an image locally and tag it as `my-cool-app:1.0`. They then try to run `docker push my-cool-app:1.0` but it fails. What is the cause of the failure?",
            points: 20,
            options: [
                {
                    id: "opt_q6_tag_too_simple",
                    label:
                        "The image tag `1.0` is too simple; Docker Hub requires semantic versioning such as `1.0.0` and will reject any push whose tag does not include all three numeric components in the version field.",
                    isCorrect: false,
                },
                {
                    id: "opt_q6_use_docker_upload",
                    label:
                        "The `docker push` command is only supported for private registries; pushing to Docker Hub specifically requires a different command such as `docker upload` to deliver the image into the user's account.",
                    isCorrect: false,
                },
                {
                    id: "opt_q6_forgot_login",
                    label:
                        "The developer forgot to log in; the push command should have been written as `docker push --user testuser --password <token> my-cool-app:1.0` so that the Docker Hub registry can accept it.",
                    isCorrect: false,
                },
                {
                    id: "opt_q6_namespace_tag",
                    label:
                        "To push an image to Docker Hub, it must be tagged with the user's namespace. The correct tag should be in the format `testuser/my-cool-app:1.0`, otherwise the registry cannot route the image to the user's account.",
                    isCorrect: true,
                },
                {
                    id: "opt_q6_build_push_flag",
                    label:
                        "The image must be built using the `docker build --push` flag, which is the only supported way to publish an image to Docker Hub because it builds and pushes the artifact in a single combined step.",
                    isCorrect: false,
                },
            ],
        },
    ],
    totalPoints: 120,
    assignedStudents: [],
    status: "draft",
    createdBy: adminId,
    createdAt: now,
    updatedAt: now,
});

print(JSON.stringify({ insertedId: result.insertedId }));
