"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconSend,
  IconX,
} from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PlanRequest {
  _id: string;
  membru: {
    id: string;
    nume: string;
    email: string;
  };
  antrenor: {
    id: string;
    nume: string;
  };
  tipPlan: "alimentar" | "exercitii" | "ambele";
  mesaj: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  raspuns: string;
  dataCrearii: string;
  dataRaspunsului?: string;
}

export default function PlanRequestsPage() {
  const { data: session } = useSession();
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PlanRequest | null>(
    null
  );
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planContent, setPlanContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchPlanRequests();
    }
  }, [session]);

  const fetchPlanRequests = async () => {
    try {
      const response = await fetch("/api/plan-requests");
      if (response.ok) {
        const data = await response.json();
        setPlanRequests(data);
      }
    } catch (error) {
      console.error("Eroare la încărcarea cererilor:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch("/api/plan-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          status: status,
        }),
      });

      if (response.ok) {
        toast.success("Statusul a fost actualizat!");
        fetchPlanRequests();
      } else {
        toast.error("Eroare la actualizarea statusului");
      }
    } catch (error) {
      console.error("Eroare la actualizarea statusului:", error);
      toast.error("Eroare la actualizarea statusului");
    }
  };

  const sendPlan = async () => {
    if (!selectedRequest || !planContent.trim()) {
      toast.error("Planul nu poate fi gol");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/plan-requests/send-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planRequestId: selectedRequest._id,
          planContent: planContent,
        }),
      });

      if (response.ok) {
        toast.success("Planul a fost trimis cu succes!");
        setPlanDialogOpen(false);
        setSelectedRequest(null);
        setPlanContent("");
        fetchPlanRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Eroare la trimiterea planului");
      }
    } catch (error) {
      console.error("Eroare la trimiterea planului:", error);
      toast.error("Eroare la trimiterea planului");
    } finally {
      setSending(false);
    }
  };

  const rejectPlan = async (requestId: string) => {
    try {
      setSending(true);
      const response = await fetch("/api/plan-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          status: "rejected",
          raspuns: "Respins",
        }),
      });

      if (response.ok) {
        toast.success("Planul a fost respins cu succes");
        fetchPlanRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Eroare la respingerea planului");
      }
    } catch (error) {
      console.error("Eroare la respingerea planului:", error);
      toast.error("Eroare la respingerea planului");
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
      rejected: "destructive",
    } as const;

    const labels = {
      pending: "În așteptare",
      in_progress: "În lucru",
      completed: "Finalizat",
      rejected: "Respins",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPlanTypeText = (tipPlan: string) => {
    const types = {
      alimentar: "Plan alimentar",
      exercitii: "Plan de exerciții",
      ambele: "Plan alimentar și exerciții",
    };
    return types[tipPlan as keyof typeof types] || tipPlan;
  };

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Se încarcă...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = planRequests.filter(
    (req) => req.status === "pending"
  );
  const inProgressRequests = planRequests.filter(
    (req) => req.status === "in_progress"
  );
  const completedRequests = planRequests.filter(
    (req) => req.status === "completed"
  );
  const rejectedRequests = planRequests.filter(
    (req) => req.status === "rejected"
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cereri de Planuri</h1>
          <p className="text-muted-foreground mt-1">
            Gestionează cererile de planuri alimentare și de exerciții
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              În așteptare ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              În lucru ({inProgressRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Finalizate ({completedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Respinse ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center p-8">
                <p>Se încarcă cererile...</p>
              </div>
            ) : pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {request.membru.nume.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {request.membru.nume}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getPlanTypeText(request.tipPlan)}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <IconCalendar className="h-4 w-4 mr-1" />
                            <span>
                              {format(
                                new Date(request.dataCrearii),
                                "d MMMM yyyy",
                                {
                                  locale: ro,
                                }
                              )}
                            </span>
                          </div>
                          <div className="mt-2 p-3 mr-5 bg-muted rounded-md">
                            <p className="text-sm">{request.mesaj}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateRequestStatus(request._id, "in_progress")
                          }
                        >
                          <IconClock className="h-4 w-4 mr-1" />
                          Acceptă
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => rejectPlan(request._id)}
                        >
                          <IconX className="h-4 w-4 mr-1" />
                          Respinge Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Nu există cereri în așteptare
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4 mt-6">
            {inProgressRequests.length > 0 ? (
              inProgressRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {request.membru.nume.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {request.membru.nume}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getPlanTypeText(request.tipPlan)}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <IconCalendar className="h-4 w-4 mr-1" />
                            <span>
                              {format(
                                new Date(request.dataCrearii),
                                "d MMMM yyyy",
                                {
                                  locale: ro,
                                }
                              )}
                            </span>
                          </div>
                          <div className="mt-2 p-3 mr-5 bg-muted rounded-md">
                            <p className="text-sm">{request.mesaj}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setPlanDialogOpen(true);
                          }}
                        >
                          <IconSend className="h-4 w-4 mr-1" />
                          Trimite Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Nu există cereri în lucru
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {request.membru.nume.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {request.membru.nume}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getPlanTypeText(request.tipPlan)}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <IconCalendar className="h-4 w-4 mr-1" />
                            <span>
                              Trimis:{" "}
                              {format(
                                new Date(request.dataRaspunsului!),
                                "d MMMM yyyy",
                                {
                                  locale: ro,
                                }
                              )}
                            </span>
                          </div>
                          <div className="mt-2 p-3 mr-5 bg-muted rounded-md">
                            <p className="text-sm">{request.mesaj}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="secondary">
                          <IconCheck className="h-3 w-3 mr-1" />
                          Plan trimis
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Nu există cereri finalizate
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedRequests.length > 0 ? (
              rejectedRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {request.membru.nume.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {request.membru.nume}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getPlanTypeText(request.tipPlan)}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <IconCalendar className="h-4 w-4 mr-1" />
                            <span>
                              Respins:{" "}
                              {format(
                                new Date(request.dataRaspunsului!),
                                "d MMMM yyyy",
                                {
                                  locale: ro,
                                }
                              )}
                            </span>
                          </div>
                          <div className="mt-2 p-3 mr-5 bg-muted rounded-md">
                            <p className="text-sm">{request.mesaj}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="destructive">
                          <IconX className="h-3 w-3 mr-1" />
                          Plan respins
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Nu există cereri respinse
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trimite Plan</DialogTitle>
            <DialogDescription>
              Creează și trimite planul pentru {selectedRequest?.membru.nume}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRequest && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedRequest.membru.nume.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedRequest.membru.nume}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getPlanTypeText(selectedRequest.tipPlan)}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="plan">Conținutul planului</Label>
              <Textarea
                id="plan"
                placeholder="Scrie aici planul alimentar/de exerciții pentru acest membru..."
                value={planContent}
                onChange={(e) => setPlanContent(e.target.value)}
                rows={10}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Anulează
            </Button>
            <Button
              onClick={sendPlan}
              disabled={sending || !planContent.trim()}
            >
              {sending ? "Se trimite..." : "Trimite planul"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
