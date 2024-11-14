"use client";

import { type StartRequest, startRequestSchema } from "@/app/api/start/start.validation";
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
  toFormFieldLabel,
} from "@local/ui";
import type React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

export function StartForm() {
  const form = useForm<StartRequest>({
    resolver: zodResolver(startRequestSchema),
  });

  const onSubmit = useCallback(async (data: StartRequest) => {}, []);

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
        {Object.entries(startRequestSchema.shape).map(([fieldName, fieldSchema]) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName as keyof StartRequest}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{toFormFieldLabel(fieldName)}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{fieldSchema.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Start</Button>
      </form>
    </Form>
  );
}
