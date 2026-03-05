"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type UploadState = "idle" | "reading" | "analyzing" | "success" | "error";

export default function UploadZone() {
    const [state, setState] = useState<UploadState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [progress, setProgress] = useState<string>("");
    const router = useRouter();

    const handleFile = useCallback(
        async (file: File) => {
            // Client-side size check
            if (file.size > 5 * 1024 * 1024) {
                setError("File is too large. Please upload a file under 5MB.");
                setState("error");
                return;
            }

            const isCSV =
                file.name.toLowerCase().endsWith(".csv") ||
                file.type === "text/csv" ||
                file.type === "application/vnd.ms-excel";
            const isPDF =
                file.name.toLowerCase().endsWith(".pdf") ||
                file.type === "application/pdf";

            if (!isCSV && !isPDF) {
                setError("Please upload a CSV or PDF bank statement.");
                setState("error");
                return;
            }

            setFileName(file.name);
            setError(null);
            setState("reading");
            setProgress("Reading file...");

            try {
                let payload: {
                    text?: string;
                    base64?: string;
                    fileType: "csv" | "pdf";
                };

                if (isCSV) {
                    const text = await file.text();
                    payload = { text, fileType: "csv" };
                } else {
                    setProgress("Processing PDF...");
                    const buffer = await file.arrayBuffer();
                    const uint8 = new Uint8Array(buffer);
                    // Convert to base64 in chunks to avoid stack overflow on large files
                    let binary = "";
                    const chunkSize = 8192;
                    for (let i = 0; i < uint8.length; i += chunkSize) {
                        binary += String.fromCharCode(
                            ...uint8.slice(i, i + chunkSize)
                        );
                    }
                    const base64 = btoa(binary);
                    payload = { base64, fileType: "pdf" };
                }

                setState("analyzing");
                setProgress("Analysing with AI...");

                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || `Analysis failed (HTTP ${response.status})`
                    );
                }

                sessionStorage.setItem("spendlens_analysis", JSON.stringify(data));
                setState("success");
                setProgress("Done!");

                // Small delay so success state is visible
                setTimeout(() => router.push("/dashboard"), 600);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Something went wrong. Please try again.";
                setError(message);
                setState("error");
                setProgress("");
            }
        },
        [router]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (rejectedFiles.length > 0) {
                const code = rejectedFiles[0].errors[0]?.code;
                if (code === "file-too-large") {
                    setError("File too large. Maximum size is 5MB.");
                } else if (code === "file-invalid-type") {
                    setError("Please upload a CSV or PDF file.");
                } else {
                    setError("Could not read this file. Please check the format.");
                }
                setState("error");
                return;
            }
            if (acceptedFiles.length > 0) {
                handleFile(acceptedFiles[0]);
            }
        },
        [handleFile]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/pdf": [".pdf"],
            "application/vnd.ms-excel": [".csv"],
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
        disabled: state === "analyzing" || state === "success",
    });

    const isLoading = state === "reading" || state === "analyzing";
    const isSuccess = state === "success";

    const reset = () => {
        setState("idle");
        setError(null);
        setFileName(null);
        setProgress("");
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
          relative cursor-pointer rounded-[12px] border-2 border-dashed
          transition-all duration-300 select-none
          ${isDragActive
                        ? "border-accent bg-accent/5 scale-[1.01]"
                        : isSuccess
                            ? "border-success bg-success/5"
                            : state === "error"
                                ? "border-danger/50 bg-danger/5"
                                : "border-border hover:border-border-light hover:bg-surface-alt"
                    }
          ${isLoading ? "pointer-events-none opacity-80" : ""}
        `}
                style={{ padding: "3rem 2rem" }}
            >
                {/* Hidden file input — REQUIRED for ios safari iframe fallback */}
                <input {...getInputProps()} id="file-upload-input" />

                <div className="flex flex-col items-center gap-4 text-center">
                    {/* Icon */}
                    <div
                        className={`
            flex h-16 w-16 items-center justify-center rounded-full transition-colors
            ${isDragActive
                                ? "bg-accent/20 text-accent"
                                : isSuccess
                                    ? "bg-success/20 text-success"
                                    : state === "error"
                                        ? "bg-danger/20 text-danger"
                                        : "bg-surface-alt text-muted"
                            }
          `}
                    >
                        {isLoading ? (
                            <Loader2 size={28} className="animate-spin" />
                        ) : isSuccess ? (
                            <CheckCircle size={28} />
                        ) : state === "error" ? (
                            <AlertCircle size={28} />
                        ) : isDragActive ? (
                            <Upload size={28} />
                        ) : (
                            <FileText size={28} />
                        )}
                    </div>

                    {/* Text */}
                    {isLoading ? (
                        <div>
                            <p className="text-primary font-medium text-base">
                                {progress}
                            </p>
                            <p className="text-muted text-sm mt-1">
                                This usually takes 5–15 seconds
                            </p>
                        </div>
                    ) : isSuccess ? (
                        <div>
                            <p className="text-success font-medium text-base">
                                Analysis complete!
                            </p>
                            <p className="text-muted text-sm mt-1">Redirecting to dashboard…</p>
                        </div>
                    ) : isDragActive ? (
                        <p className="text-accent font-medium text-base">
                            Drop your file here
                        </p>
                    ) : (
                        <div>
                            <p className="text-primary font-medium text-base">
                                {fileName ? `Selected: ${fileName}` : "Drop your bank statement here"}
                            </p>
                            <p className="text-muted text-sm mt-1">
                                or{" "}
                                <span className="text-accent underline underline-offset-2 cursor-pointer">
                                    browse files
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {state === "error" && error && (
                        <div className="mt-1 rounded-lg bg-danger/10 border border-danger/20 px-4 py-2">
                            <p className="text-danger text-sm">{error}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    reset();
                                }}
                                className="mt-1.5 text-xs text-muted hover:text-primary underline transition-colors cursor-pointer"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Supported formats */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {["CSV", "PDF"].map((fmt) => (
                    <span
                        key={fmt}
                        className="rounded-full border border-border px-3 py-0.5 text-xs text-muted"
                    >
                        {fmt}
                    </span>
                ))}
                <span className="text-xs text-muted ml-1">
                    · HDFC, ICICI, SBI, Axis, Kotak
                </span>
            </div>
        </div>
    );
}
