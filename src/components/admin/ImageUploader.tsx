"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  uploadPuzzleImages,
  variantsToFormImage,
} from "@/lib/api/admin-image-upload";
import type { PuzzleFormImage } from "@/lib/api/admin-puzzle-form";

interface ImageUploaderProps {
  value: PuzzleFormImage[];
  onChange: (next: PuzzleFormImage[]) => void;
  defaultAlt: string;
  defaultAltEn: string;
  error?: string;
}

export function ImageUploader({
  value,
  onChange,
  defaultAlt,
  defaultAltEn,
  error,
}: ImageUploaderProps) {
  const t = useTranslations("admin.puzzles.form.images");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneId = useId();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      if (value.length + list.length > 20) {
        toast({
          title: t("toast.tooMany"),
          variant: "destructive",
        });
        return;
      }
      setUploading(true);
      try {
        const result = await uploadPuzzleImages(list);
        const newImages: PuzzleFormImage[] = result.uploaded.map((variants) =>
          variantsToFormImage(variants, defaultAlt, defaultAltEn),
        );
        onChange([...value, ...newImages]);
        if (result.mocked) {
          toast({
            title: t("toast.uploadedMock"),
            description: t("toast.uploadedMockDescription"),
          });
        } else {
          toast({
            title: t("toast.uploaded"),
          });
        }
      } catch (err) {
        toast({
          title: t("toast.uploadFailed"),
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        });
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [defaultAlt, defaultAltEn, onChange, t, toast, value],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  function onReorder(result: DropResult) {
    if (!result.destination) return;
    const next = [...value];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateImage(index: number, patch: Partial<PuzzleFormImage>) {
    const next = value.map((img, i) =>
      i === index ? { ...img, ...patch } : img,
    );
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div
        id={dropZoneId}
        role="region"
        aria-label={t("dropzoneLabel")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragOver
            ? "border-sage bg-sage/5"
            : "border-border bg-muted/40"
        }`}
      >
        <Upload
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">{t("dropHere")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? t("uploading") : t("browse")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <DragDropContext onDragEnd={onReorder}>
          <Droppable droppableId="puzzle-images">
            {(droppable) => (
              <ul
                ref={droppable.innerRef}
                {...droppable.droppableProps}
                className="space-y-2"
              >
                {value.map((image, index) => (
                  <Draggable
                    key={`${image.url}-${index}`}
                    draggableId={`image-${index}`}
                    index={index}
                  >
                    {(draggable, snapshot) => (
                      <li
                        ref={draggable.innerRef}
                        {...draggable.draggableProps}
                        className={`flex items-stretch gap-3 rounded-md border border-border bg-white p-3 ${
                          snapshot.isDragging ? "shadow-md" : ""
                        }`}
                      >
                        <div
                          {...draggable.dragHandleProps}
                          className="flex shrink-0 cursor-grab items-center text-muted-foreground"
                          aria-label={t("dragHandle")}
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cream">
                          <Image
                            src={image.url}
                            alt={image.alt || ""}
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized={image.url.startsWith("data:")}
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <Label
                                htmlFor={`alt-${index}`}
                                className="text-xs"
                              >
                                {t("altUk")}
                              </Label>
                              <Input
                                id={`alt-${index}`}
                                value={image.alt}
                                onChange={(e) =>
                                  updateImage(index, { alt: e.target.value })
                                }
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`altEn-${index}`}
                                className="text-xs"
                              >
                                {t("altEn")}
                              </Label>
                              <Input
                                id={`altEn-${index}`}
                                value={image.altEn}
                                onChange={(e) =>
                                  updateImage(index, {
                                    altEn: e.target.value,
                                  })
                                }
                                className="h-8"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("position", { n: index + 1 })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("remove")}
                          onClick={() => removeAt(index)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {droppable.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      ) : null}
    </div>
  );
}
