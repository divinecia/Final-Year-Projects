"use client";

// Kigali, Southern, Western, Northern, Eastern Province locations
type DistrictKey = keyof typeof locations.districts;
const locations = {
  districts: {
    gasabo: {
      name: "Gasabo",
      province: "Kigali City",
      code: "11",
      sectors: {
        bumbogo: { name: "Bumbogo", code: "1101" },
        gatsata: { name: "Gatsata", code: "1102" },
        gikomero: { name: "Gikomero", code: "1103" },
        gisozi: { name: "Gisozi", code: "1104" },
        jabana: { name: "Jabana", code: "1105" },
        jali: { name: "Jali", code: "1106" },
        kacyiru: { name: "Kacyiru", code: "1107" },
        kimihurura: { name: "Kimihurura", code: "1108" },
        kimironko: { name: "Kimironko", code: "1109" },
        kinyinya: { name: "Kinyinya", code: "1110" },
        ndera: { name: "Ndera", code: "1111" },
        nduba: { name: "Nduba", code: "1112" },
        remera: { name: "Remera", code: "1113" },
        rusororo: { name: "Rusororo", code: "1114" },
        rutunga: { name: "Rutunga", code: "1115" }
      }
    },
    kicukiro: {
      name: "Kicukiro",
      province: "Kigali City",
      code: "12",
      sectors: {
        gahanga: { name: "Gahanga", code: "1201" },
        gatenga: { name: "Gatenga", code: "1202" },
        gikondo: { name: "Gikondo", code: "1203" },
        kagarama: { name: "Kagarama", code: "1204" },
        kanombe: { name: "Kanombe", code: "1205" },
        kicukiro: { name: "Kicukiro", code: "1206" },
        masaka: { name: "Masaka", code: "1207" },
        niboye: { name: "Niboye", code: "1208" },
        nyarugunga: { name: "Nyarugunga", code: "1209" },
        rwebitaba: { name: "Rwebitaba", code: "1210" }
      }
    },
    nyarugenge: {
      name: "Nyarugenge",
      province: "Kigali City",
      code: "13",
      sectors: {
        gitega: { name: "Gitega", code: "1301" },
        kimisagara: { name: "Kimisagara", code: "1302" },
        kugirema: { name: "Kugirema", code: "1303" },
        mageragere: { name: "Mageragere", code: "1304" },
        muhima: { name: "Muhima", code: "1305" },
        nyakabanda: { name: "Nyakabanda", code: "1306" },
        nyamirambo: { name: "Nyamirambo", code: "1307" },
        nyarugenge: { name: "Nyarugenge", code: "1308" },
        rwezamenyo: { name: "Rwezamenyo", code: "1309" }
      }
    },
    muhanga: {
      name: "Muhanga",
      province: "Southern Province",
      code: "22",
      sectors: {
        cyeza: { name: "Cyeza", code: "2201" },
        kabacuzi: { name: "Kabacuzi", code: "2202" },
        kibangu: { name: "Kibangu", code: "2203" },
        kiyumba: { name: "Kiyumba", code: "2204" },
        muhanga: { name: "Muhanga", code: "2205" },
        mukura: { name: "Mukura", code: "2206" },
        mushishiro: { name: "Mushishiro", code: "2207" },
        nyabindu: { name: "Nyabindu", code: "2208" },
        nyamabuye: { name: "Nyamabuye", code: "2209" },
        nyarubaka: { name: "Nyarubaka", code: "2210" },
        rongi: { name: "Rongi", code: "2211" },
        rugendabari: { name: "Rugendabari", code: "2212" }
      }
    },
    karongi: {
      name: "Karongi",
      province: "Western Province",
      code: "31",
      sectors: {
        bwishyura: { name: "Bwishyura", code: "3101" },
        gashari: { name: "Gashari", code: "3102" },
        gitesi: { name: "Gitesi", code: "3103" },
        kivumu: { name: "Kivumu", code: "3104" },
        mutuntu: { name: "Mutuntu", code: "3105" },
        rugabano: { name: "Rugabano", code: "3106" },
        ruganda: { name: "Ruganda", code: "3107" },
        murambi: { name: "Murambi", code: "3108" },
        gishyita: { name: "Gishyita", code: "3109" },
        twumba: { name: "Twumba", code: "3110" }
      }
    },
    musanze: {
      name: "Musanze",
      province: "Northern Province",
      code: "41",
      sectors: {
        busogo: { name: "Busogo", code: "4101" },
        cyuve: { name: "Cyuve", code: "4102" },
        gacaca: { name: "Gacaca", code: "4103" },
        gashaki: { name: "Gashaki", code: "4104" },
        gataraga: { name: "Gataraga", code: "4105" },
        kimonyi: { name: "Kimonyi", code: "4106" },
        kinigi: { name: "Kinigi", code: "4107" },
        muhoza: { name: "Muhoza", code: "4108" },
        muko: { name: "Muko", code: "4109" },
        musanze: { name: "Musanze", code: "4110" },
        nkotsi: { name: "Nkotsi", code: "4111" },
        nyange: { name: "Nyange", code: "4112" },
        remera: { name: "Remera", code: "4113" },
        rwaza: { name: "Rwaza", code: "4114" },
        shingiro: { name: "Shingiro", code: "4115" }
      }
    },
    rwamagana: {
      name: "Rwamagana",
      province: "Eastern Province",
      code: "51",
      sectors: {
        fumbwe: { name: "Fumbwe", code: "5101" },
        gahengeri: { name: "Gahengeri", code: "5102" },
        gishari: { name: "Gishari", code: "5103" },
        karenge: { name: "Karenge", code: "5104" },
        kigabiro: { name: "Kigabiro", code: "5105" },
        muhazi: { name: "Muhazi", code: "5106" },
        munyaga: { name: "Munyaga", code: "5107" },
        munyiginya: { name: "Munyiginya", code: "5108" },
        musha: { name: "Musha", code: "5109" },
        muyumbu: { name: "Muyumbu", code: "5110" },
        nyakaliro: { name: "Nyakaliro", code: "5111" },
        nzige: { name: "Nzige", code: "5112" },
        rubona: { name: "Rubona", code: "5113" },
        rukira: { name: "Rukira", code: "5114" }
      }
    }
  },
  lastUpdated: "2024-07-22T00:00:00Z"
};

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "../form-provider";
import { OAuthButtons } from "@/components/oauth-buttons";

const Step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  email: z.string().email("Please enter a valid email address."),
  district: z.string({ required_error: "Please select a district." }),
  sector: z.string({ required_error: "Please select a sector." }),
  address: z.string().min(5, "Please enter a detailed address."),
  propertyType: z.enum([
    "single_family",
    "apartment",
    "townhouse",
    "condominium",
    "villa",
    "duplex",
    "servant_quarters"
  ], { required_error: "Please select a property type." }),
  numRooms: z.coerce.number().min(1, "Must have at least one room."),
  hasGarden: z.enum(["yes", "no"]),
});

export default function HouseholdRegisterStep1Page() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();

  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      ...formData,
      fullName: formData.fullName || "",
      phone: formData.phone || "",
      email: formData.email || "",
      district: formData.district || undefined,
      sector: formData.sector || undefined,
      address: formData.address || "",
      propertyType: formData.propertyType || "single_family",
      numRooms: formData.numRooms || 1,
      hasGarden: formData.hasGarden || "no",
    },
  });

  async function onSubmit(values: z.infer<typeof Step1Schema>) {
    try {
      setFormData((prev) => ({ ...prev, ...values }));
      router.push("/household/register/step-2");
    } catch {
      // Handle error silently or show a toast
    }
  }

  return (
    <>
      <Progress value={33} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Find Trusted Help for Your Home</CardTitle>
          <CardDescription>Step 1: Basic Information</CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth registration options */}
          <div className="mb-6">
            <p className="text-center text-sm mb-2">Register with:</p>
            <div className="flex justify-center gap-4">
              <OAuthButtons
                onSuccess={(uid, email) => {
                  setFormData((prev: Record<string, unknown>) => ({ ...prev, email }));
                  router.push("/household/register/step-2");
                }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">or fill out the form below</div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="e.g. 078xxxxxxx" type="tel" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input placeholder="e.g. jane.doe@example.com" type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />

                <Separator />
                <h3 className="font-semibold text-md">Address Information</h3>
                
                <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select your district" /></SelectTrigger></FormControl>
                    <SelectContent>
                    <SelectItem value="gasabo">Gasabo</SelectItem>
                    <SelectItem value="kicukiro">Kicukiro</SelectItem>
                    <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => {
                  const selectedDistrict = form.watch("district") as DistrictKey;
                  const sectorOptions = selectedDistrict && locations.districts[selectedDistrict]?.sectors
                    ? Object.entries(locations.districts[selectedDistrict].sectors as Record<string, { name: string; code: string }>)
                    : [];
                  return (
                    <FormItem>
                      <FormLabel>Sector (matched to district)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your sector" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {sectorOptions.length > 0 ? (
                            sectorOptions.map(([key, sector]) => (
                              <SelectItem key={key} value={key}>{sector.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No sectors available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Address</FormLabel>
                    <FormControl><Textarea placeholder="Street, house number, or landmark" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <h3 className="font-semibold text-md">Property Details</h3>

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="single_family">Single-Family Homes</SelectItem>
                        <SelectItem value="apartment">Apartments/Flats</SelectItem>
                        <SelectItem value="townhouse">Townhouses/Row Houses</SelectItem>
                        <SelectItem value="condominium">Condominiums</SelectItem>
                        <SelectItem value="villa">Villas</SelectItem>
                        <SelectItem value="duplex">Duplex/Multi-family Units</SelectItem>
                        <SelectItem value="servant_quarters">Servant Quarters/Studio Housing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Rooms</FormLabel>
                    <FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasGarden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Has Garden?</FormLabel>
                     <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <span/>
                <Button type="submit">Next</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/household/login" className="font-semibold text-primary hover:underline">
          Login here
        </Link>
      </div>
    </>
  );
}
