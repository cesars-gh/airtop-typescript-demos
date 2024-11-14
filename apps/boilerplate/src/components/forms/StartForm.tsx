"use client";

import { type StartRequest, type StartResponse, startRequestSchema } from "@/app/api/start/start.validation";
import { useAppStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@local/ui";
import type React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

export function StartForm() {
  const setStartResponse = useAppStore((state) => state.setStartResponse);
  const setApiKey = useAppStore((state) => state.setApiKey);

  const form = useForm<StartRequest>({
    resolver: zodResolver(startRequestSchema),
    defaultValues: {
      apiKey: "",
      profileId: "",
    },
  });

  const onSubmit = useCallback(
    async (data: StartRequest) => {
      setApiKey(data.apiKey);

      const response = await fetch("/api/start", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as StartResponse;
      setStartResponse(result);
    },
    [setStartResponse, setApiKey],
  );

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent the default form submission behavior which will refresh the page
      form.handleSubmit(onSubmit)(event);
    },
    [form.handleSubmit, onSubmit],
  );

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          name="apiKey"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>{startRequestSchema.shape.apiKey.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="profileId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>{startRequestSchema.shape.profileId.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Start
        </Button>
      </form>
    </Form>
  );
}
