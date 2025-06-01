"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  IconHeart,
  IconPlus,
  IconEdit,
  IconEye,
  IconSearch,
  IconDownload,
} from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data for care plan requests
const carePlanRequests = [
  {
    id: 1,
    clientId: 1,
    clientName: "Alexandru Popescu",
    clientAvatar: "/avatar-placeholder.png",
    type: "alimentar", // alimentar, exercitii, complet
    status: "pending", // pending, in_progress, completed
    requestDate: new Date(2025, 5, 1),
    message:
      "Aș vrea un plan alimentar pentru creșterea masei musculare. Am 25 de ani, 75kg, înălțime 180cm. Fac sport de 3 ori pe săptămână.",
    priority: "medium",
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Ana Ionescu",
    clientAvatar: "/avatar-placeholder.png",
    type: "exercitii",
    status: "in_progress",
    requestDate: new Date(2025, 4, 28),
    message:
      "Vreau un program de exerciții pentru slăbire și tonifiere. Am probleme cu genunchii, deci exercițiile trebuie să fie adaptate.",
    priority: "high",
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Mihai Georgescu",
    clientAvatar: "/avatar-placeholder.png",
    type: "complet",
    status: "completed",
    requestDate: new Date(2025, 4, 25),
    message:
      "Doresc un plan complet (alimentar + exerciții) pentru performanță în sport. Practic fotbal la nivel competitiv.",
    priority: "high",
  },
  {
    id: 4,
    clientId: 4,
    clientName: "Elena Marinescu",
    clientAvatar: "/avatar-placeholder.png",
    type: "alimentar",
    status: "pending",
    requestDate: new Date(2025, 5, 2),
    message:
      "Am nevoie de un plan alimentar pentru menținerea greutății și energie pentru antrenamente. Sunt vegetariană.",
    priority: "low",
  },
];

// Mock data for existing plans
const existingPlans = [
  {
    id: 1,
    clientId: 1,
    clientName: "Alexandru Popescu",
    clientAvatar: "/avatar-placeholder.png",
    title: "Plan creștere masă musculară",
    type: "alimentar",
    createdDate: new Date(2025, 4, 20),
    lastUpdated: new Date(2025, 4, 25),
    status: "active",
    content: "Plan alimentar detaliat pentru creșterea masei musculare...",
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Ana Ionescu",
    clientAvatar: "/avatar-placeholder.png",
    title: "Program slăbire și tonifiere",
    type: "exercitii",
    createdDate: new Date(2025, 4, 15),
    lastUpdated: new Date(2025, 4, 20),
    status: "active",
    content: "Program de exerciții adaptat pentru slăbire...",
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Mihai Georgescu",
    clientAvatar: "/avatar-placeholder.png",
    title: "Plan complet performanță fotbal",
    type: "complet",
    createdDate: new Date(2025, 4, 10),
    lastUpdated: new Date(2025, 4, 22),
    status: "completed",
    content: "Plan complet pentru îmbunătățirea performanței în fotbal...",
  },
];

export default function Page() {
  type CarePlanRequest = (typeof carePlanRequests)[number];
  const [selectedRequest, setSelectedRequest] =
    useState<CarePlanRequest | null>(null);
  type Plan = (typeof existingPlans)[number];
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // New plan form state
  const [newPlan, setNewPlan] = useState({
    clientId: "",
    title: "",
    type: "",
    content: "",
  });

  // Filter requests
  const filteredRequests = carePlanRequests.filter((request) => {
    const matchesSearch =
      request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter plans
  const filteredPlans = existingPlans.filter((plan) => {
    const matchesSearch =
      plan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || plan.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Handle request actions
  const handleViewRequest = (request: CarePlanRequest) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const handleCreatePlan = (request?: CarePlanRequest) => {
    if (request) {
      setNewPlan({
        clientId: request.clientId.toString(),
        title: `Plan ${request.type} - ${request.clientName}`,
        type: request.type,
        content: "",
      });
    } else {
      setNewPlan({
        clientId: "",
        title: "",
        type: "",
        content: "",
      });
    }
    setCreatePlanDialogOpen(true);
  };

  const handleViewPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanDialogOpen(true);
  };

  const savePlan = () => {
    if (newPlan.clientId && newPlan.title && newPlan.type && newPlan.content) {
      // In a real app, you would call an API to save the plan
      console.log("Plan saved:", newPlan);
      setCreatePlanDialogOpen(false);
      setNewPlan({ clientId: "", title: "", type: "", content: "" });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "outline";
      case "active":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alimentar":
        return "🍎";
      case "exercitii":
        return "💪";
      case "complet":
        return "⭐";
      default:
        return "📋";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Planuri</h1>
            <p className="text-muted-foreground mt-1">
              Gestionează planurile alimentare și de exerciții pentru clienții
              tăi
            </p>
          </div>

          <Button onClick={() => handleCreatePlan()}>
            <IconPlus className="h-4 w-4 mr-1" />
            Plan nou
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută după nume client sau conținut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtru status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate statusurile</SelectItem>
              <SelectItem value="pending">În așteptare</SelectItem>
              <SelectItem value="in_progress">În progres</SelectItem>
              <SelectItem value="completed">Finalizate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtru tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate tipurile</SelectItem>
              <SelectItem value="alimentar">Alimentar</SelectItem>
              <SelectItem value="exercitii">Exerciții</SelectItem>
              <SelectItem value="complet">Complet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList>
            <TabsTrigger value="requests">
              Cereri noi (
              {carePlanRequests.filter((r) => r.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              În progres (
              {
                carePlanRequests.filter((r) => r.status === "in_progress")
                  .length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="plans">
              Planuri create ({existingPlans.length})
            </TabsTrigger>
          </TabsList>

          {/* New Requests Tab */}
          <TabsContent value="requests" className="space-y-4 mt-6">
            {filteredRequests.filter((r) => r.status === "pending").length >
            0 ? (
              <div className="grid gap-4">
                {filteredRequests
                  .filter((r) => r.status === "pending")
                  .map((request) => (
                    <Card
                      key={request.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={request.clientAvatar}
                                alt={request.clientName}
                              />
                              <AvatarFallback>
                                {request.clientName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {request.clientName}
                                </h3>
                                <span className="text-xl">
                                  {getTypeIcon(request.type)}
                                </span>
                                <Badge variant="outline">
                                  {request.type === "alimentar" &&
                                    "Plan alimentar"}
                                  {request.type === "exercitii" &&
                                    "Plan exerciții"}
                                  {request.type === "complet" && "Plan complet"}
                                </Badge>
                                <Badge
                                  className={getPriorityColor(request.priority)}
                                >
                                  {request.priority === "high" &&
                                    "Prioritate înaltă"}
                                  {request.priority === "medium" &&
                                    "Prioritate medie"}
                                  {request.priority === "low" &&
                                    "Prioritate scăzută"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground line-clamp-2">
                                {request.message}
                              </p>
                              <div className="text-sm text-muted-foreground mt-2">
                                Cerere din{" "}
                                {format(request.requestDate, "d MMMM yyyy", {
                                  locale: ro,
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRequest(request)}
                            >
                              <IconEye className="h-4 w-4 mr-1" />
                              Vezi
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCreatePlan(request)}
                            >
                              <IconPlus className="h-4 w-4 mr-1" />
                              Creează plan
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nu ai cereri noi
                  </h3>
                  <p className="text-muted-foreground">
                    Toate cererile au fost procesate sau nu ai primit încă
                    cereri noi.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* In Progress Tab */}
          <TabsContent value="in-progress" className="space-y-4 mt-6">
            {filteredRequests.filter((r) => r.status === "in_progress").length >
            0 ? (
              <div className="grid gap-4">
                {filteredRequests
                  .filter((r) => r.status === "in_progress")
                  .map((request) => (
                    <Card
                      key={request.id}
                      className="hover:shadow-md transition-shadow border-blue-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={request.clientAvatar}
                                alt={request.clientName}
                              />
                              <AvatarFallback>
                                {request.clientName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {request.clientName}
                                </h3>
                                <span className="text-xl">
                                  {getTypeIcon(request.type)}
                                </span>
                                <Badge variant="default">În progres</Badge>
                                <Badge
                                  className={getPriorityColor(request.priority)}
                                >
                                  {request.priority === "high" &&
                                    "Prioritate înaltă"}
                                  {request.priority === "medium" &&
                                    "Prioritate medie"}
                                  {request.priority === "low" &&
                                    "Prioritate scăzută"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground line-clamp-2">
                                {request.message}
                              </p>
                              <div className="text-sm text-muted-foreground mt-2">
                                Început pe{" "}
                                {format(request.requestDate, "d MMMM yyyy", {
                                  locale: ro,
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRequest(request)}
                            >
                              <IconEye className="h-4 w-4 mr-1" />
                              Vezi
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCreatePlan(request)}
                            >
                              <IconEdit className="h-4 w-4 mr-1" />
                              Continuă
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nu ai planuri în progres
                  </h3>
                  <p className="text-muted-foreground">
                    Nu lucrezi în prezent la niciun plan. Verifică cererile noi
                    pentru a începe.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Existing Plans Tab */}
          <TabsContent value="plans" className="space-y-4 mt-6">
            {filteredPlans.length > 0 ? (
              <div className="grid gap-4">
                {filteredPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={plan.clientAvatar}
                              alt={plan.clientName}
                            />
                            <AvatarFallback>
                              {plan.clientName.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{plan.title}</h3>
                              <span className="text-xl">
                                {getTypeIcon(plan.type)}
                              </span>
                              <Badge variant={getStatusColor(plan.status)}>
                                {plan.status === "active"
                                  ? "Activ"
                                  : "Finalizat"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              {plan.clientName}
                            </p>
                            <div className="text-sm text-muted-foreground mt-2">
                              Creat pe{" "}
                              {format(plan.createdDate, "d MMMM yyyy", {
                                locale: ro,
                              })}{" "}
                              • Ultimă actualizare{" "}
                              {format(plan.lastUpdated, "d MMMM yyyy", {
                                locale: ro,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPlan(plan)}
                          >
                            <IconEye className="h-4 w-4 mr-1" />
                            Vezi
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconEdit className="h-4 w-4 mr-1" />
                            Editează
                          </Button>
                          <Button variant="outline" size="sm">
                            <IconDownload className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nu ai planuri create
                  </h3>
                  <p className="text-muted-foreground">
                    Nu ai creat încă planuri pentru clienții tăi. Începe prin a
                    răspunde la cereri.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cerere plan de îngrijire</DialogTitle>
            <DialogDescription>
              Detalii complete despre cererea clientului
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedRequest.clientAvatar}
                    alt={selectedRequest.clientName}
                  />
                  <AvatarFallback>
                    {selectedRequest.clientName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedRequest.clientName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">
                      {getTypeIcon(selectedRequest.type)}
                    </span>
                    <Badge variant="outline">
                      {selectedRequest.type === "alimentar" && "Plan alimentar"}
                      {selectedRequest.type === "exercitii" && "Plan exerciții"}
                      {selectedRequest.type === "complet" && "Plan complet"}
                    </Badge>
                    <Badge
                      className={getPriorityColor(selectedRequest.priority)}
                    >
                      {selectedRequest.priority === "high" &&
                        "Prioritate înaltă"}
                      {selectedRequest.priority === "medium" &&
                        "Prioritate medie"}
                      {selectedRequest.priority === "low" &&
                        "Prioritate scăzută"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Mesajul clientului:
                </Label>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <p className="text-sm">{selectedRequest.message}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Cerere trimisă pe{" "}
                {format(selectedRequest.requestDate, "d MMMM yyyy 'la' HH:mm", {
                  locale: ro,
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
            >
              Închide
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  handleCreatePlan(selectedRequest);
                }
                setRequestDialogOpen(false);
              }}
            >
              <IconPlus className="h-4 w-4 mr-1" />
              Creează plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vizualizare plan</DialogTitle>
            <DialogDescription>
              Conținutul complet al planului
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedPlan.clientAvatar}
                      alt={selectedPlan.clientName}
                    />
                    <AvatarFallback>
                      {selectedPlan.clientName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedPlan.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedPlan.clientName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {getTypeIcon(selectedPlan.type)}
                  </span>
                  <Badge variant={getStatusColor(selectedPlan.status)}>
                    {selectedPlan.status === "active" ? "Activ" : "Finalizat"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Data creării:</Label>
                  <div>
                    {format(selectedPlan.createdDate, "d MMMM yyyy", {
                      locale: ro,
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Ultima actualizare:
                  </Label>
                  <div>
                    {format(selectedPlan.lastUpdated, "d MMMM yyyy", {
                      locale: ro,
                    })}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Conținutul planului:
                </Label>
                <div className="mt-2 p-4 bg-muted rounded-md min-h-[300px]">
                  <p className="whitespace-pre-wrap">{selectedPlan.content}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Închide
            </Button>
            <Button variant="outline">
              <IconEdit className="h-4 w-4 mr-1" />
              Editează
            </Button>
            <Button>
              <IconDownload className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Plan Dialog */}
      <Dialog
        open={createPlanDialogOpen}
        onOpenChange={setCreatePlanDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Creează plan nou</DialogTitle>
            <DialogDescription>
              Completează formularul pentru a crea un plan personalizat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={newPlan.clientId}
                  onValueChange={(value) =>
                    setNewPlan({ ...newPlan, clientId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează clientul" />
                  </SelectTrigger>
                  <SelectContent>
                    {carePlanRequests.map((request) => (
                      <SelectItem
                        key={request.clientId}
                        value={request.clientId.toString()}
                      >
                        {request.clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipul planului</Label>
                <Select
                  value={newPlan.type}
                  onValueChange={(value) =>
                    setNewPlan({ ...newPlan, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alimentar">🍎 Plan alimentar</SelectItem>
                    <SelectItem value="exercitii">💪 Plan exerciții</SelectItem>
                    <SelectItem value="complet">⭐ Plan complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titlul planului</Label>
              <Input
                id="title"
                value={newPlan.title}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, title: e.target.value })
                }
                placeholder="Ex: Plan alimentar pentru creșterea masei musculare"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conținutul planului</Label>
              <Textarea
                id="content"
                value={newPlan.content}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, content: e.target.value })
                }
                placeholder="Scrie aici conținutul detaliat al planului..."
                rows={15}
                className="min-h-[300px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreatePlanDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button
              onClick={savePlan}
              disabled={
                !newPlan.clientId ||
                !newPlan.title ||
                !newPlan.type ||
                !newPlan.content
              }
            >
              <IconHeart className="h-4 w-4 mr-1" />
              Salvează planul
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
