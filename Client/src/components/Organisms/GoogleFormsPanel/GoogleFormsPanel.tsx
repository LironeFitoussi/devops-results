import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { FileText, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

import { Card } from "@/components/Atoms/Card";
import { Heading } from "@/components/Atoms/Heading";
import { Text } from "@/components/Atoms/Text";
import { Icon } from "@/components/Atoms/Icon";
import { LoadingSpinner } from "@/components/Atoms/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listForms,
  getOAuthStartUrl,
  type DriveFormSummary,
} from "@/services/googleForms";

function errMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message
    );
  }
  return error instanceof Error ? error.message : "Unknown error";
}

export default function GoogleFormsPanel() {
  const [manualId, setManualId] = useState<string>("");
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Fetch the Auth0 token per request so a query firing before
  // AppInitializer sets the axios default header still authenticates.
  const getToken = useCallback(
    () =>
      getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
        },
      }),
    [getAccessTokenSilently],
  );

  // Link the admin's Google account via our own OAuth flow (no Auth0 here).
  const connectGoogle = async () => {
    try {
      const url = await getOAuthStartUrl(await getToken());
      window.location.href = url;
    } catch (e) {
      toast.error(`Connect failed: ${errMessage(e)}`);
    }
  };

  const formsQuery = useQuery({
    queryKey: ["google-forms"],
    queryFn: async () => listForms(await getToken()),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (formsQuery.isError) {
      toast.error(`Forms: ${errMessage(formsQuery.error)}`);
    }
  }, [formsQuery.isError, formsQuery.error]);

  // Returned from the Google OAuth callback — confirm + reload forms.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "connected") {
      toast.success("Google account connected");
      window.history.replaceState({}, "", window.location.pathname);
      formsQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon icon={FileText} size="lg" className="text-blue-600" />
          <Heading level={3}>Google Forms</Heading>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={connectGoogle}>
            Connect Google
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formsQuery.refetch()}
            disabled={formsQuery.isFetching}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {formsQuery.isError && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <Text variant="small" color="muted">
            Cannot read Google Forms yet. Click{" "}
            <strong>Connect Google</strong> to link your Google account and
            grant Forms access, then Refresh.
          </Text>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Or paste a form ID…"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
        />
        <Button
          onClick={() =>
            navigate(`/google-forms/${encodeURIComponent(manualId.trim())}`)
          }
          disabled={manualId.trim().length === 0}
        >
          Load
        </Button>
      </div>

      {formsQuery.isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : formsQuery.isError ? (
        <Text color="muted">
          Could not load forms. Ensure Google scopes were consented.
        </Text>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(formsQuery.data ?? []).map((f: DriveFormSummary) => (
              <TableRow
                className="cursor-pointer"
                key={f.id}
                onClick={() =>
                  navigate(`/google-forms/${encodeURIComponent(f.id)}`)
                }
              >
                <TableCell>{f.name}</TableCell>
                <TableCell>
                  {f.modifiedTime
                    ? new Date(f.modifiedTime).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/google-forms/${encodeURIComponent(f.id)}`)
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(formsQuery.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Text color="muted">No forms found.</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

    </Card>
  );
}
