"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/records/profile-form"
import { MedicationsTable } from "@/components/records/medications-table"
import { AllergiesTable } from "@/components/records/allergies-table"
// Removed: Prescriptions and Reports tabs

export default function ProfilePage() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal details and health records.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            {/* FIX: Use flex-wrap to allow tabs to wrap on small screens, preventing collision. */}
            <TabsList className="flex w-full flex-wrap justify-start gap-2 whitespace-nowrap">
              <TabsTrigger value="profile" className="shrink-0 px-3 py-2">
                Profile
              </TabsTrigger>
              <TabsTrigger value="medications" className="shrink-0 px-3 py-2">
                Medications
              </TabsTrigger>
              <TabsTrigger value="allergies" className="shrink-0 px-3 py-2">
                Allergies
              </TabsTrigger>
              {/* Removed prescriptions and reports per requirements */}
            </TabsList>

            <TabsContent value="profile" className="p-1">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="medications" className="p-1">
              <MedicationsTable />
            </TabsContent>

            <TabsContent value="allergies" className="p-1">
              <AllergiesTable />
            </TabsContent>

            {/* Removed content for prescriptions and reports */}
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}
