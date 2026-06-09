import { useState } from "react";
import { 
  useListMenuItems, 
  useListCategories, 
  useCreateMenuItem, 
  useUpdateMenuItem, 
  useDeleteMenuItem,
  getListMenuItemsQueryKey,
  MenuItem
} from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const menuItemSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.coerce.number().optional().nullable(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  available: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function AdminMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const { data: menuItems, isLoading } = useListMenuItems();
  const { data: categories } = useListCategories();
  
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: null,
      imageUrl: "",
      available: true,
    },
  });

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || "",
      available: item.available,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      categoryId: null,
      imageUrl: "",
      available: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: MenuItemFormValues) => {
    const payload = {
      ...data,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
    };

    if (editingItem) {
      updateItem.mutate(
        { id: editingItem.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Menu item updated" });
          },
          onError: (err) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
          }
        }
      );
    } else {
      createItem.mutate(
        { data: payload as any },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Menu item created" });
          },
          onError: (err) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
          toast({ title: "Menu item deleted" });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Error", description: err.message });
        }
      }
    );
  };

  const handleToggleAvailability = (id: number, currentAvailable: boolean) => {
    updateItem.mutate(
      { id, data: { available: !currentAvailable } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">Manage Menu</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input id="price" type="number" {...form.register("price")} />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Controller
                    name="categoryId"
                    control={form.control}
                    render={({ field }) => (
                      <Select 
                        value={field.value?.toString() || ""} 
                        onValueChange={(val) => field.onChange(val ? parseInt(val) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" className="resize-none h-20" {...form.register("description")} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input id="imageUrl" placeholder="https://..." {...form.register("imageUrl")} />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="text-base">Availability</Label>
                  <p className="text-sm text-muted-foreground">Is this item currently available to order?</p>
                </div>
                <Controller
                  name="available"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                  {createItem.isPending || updateItem.isPending ? "Saving..." : "Save Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading menu items...</TableCell>
                </TableRow>
              ) : !menuItems || menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No menu items found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.name}
                      <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                        {item.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.categoryName ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                          {item.categoryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">{formatNaira(item.price)}</TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={item.available} 
                        onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                        disabled={updateItem.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{item.name}</strong> from the menu. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
