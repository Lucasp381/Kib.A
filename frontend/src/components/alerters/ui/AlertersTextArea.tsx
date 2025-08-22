import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSubTrigger,
  ContextMenuSub
} from "@/components/ui/context-menu";
import { ContextMenuSubContent } from "@/components/ui/context-menu";
import { emojiMap } from "@/lib/EmojiMap";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { rulesPlaceholders } from "@/lib/RulesPlaceholders";


interface AlertersTextAreaProps {
    id: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
  }

export default function AlertersTextArea({ id, placeholder,  onChange, onBlur , value}: AlertersTextAreaProps) {
    const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);

    return (
<div className="w-full">
  <ContextMenu >
    <ContextMenuTrigger asChild >
      <div className="w-full">

        <Textarea
          id={id}

          placeholder={placeholder || "Enter your message here..."}
          className="w-full"


          onChange={(e) => onChange?.(e.target.value)}
            value={value}
        />
      </div>
    </ContextMenuTrigger>

    <ContextMenuContent>
      <ContextMenuSub onOpenChange={setEmojiMenuOpen}>
        <ContextMenuSubTrigger>Emoji</ContextMenuSubTrigger>
        <ContextMenuSubContent className="">
        {emojiMenuOpen  && (<EmojiPicker
                previewConfig={{ showPreview: false }}
                className="w-64 h-64"
                onEmojiClick={(emoji: EmojiClickData) =>  {
                    const textarea = document.getElementById(id) as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      textarea.value = text.substring(0, start) + emoji.emoji + text.substring(end);
                      textarea.focus();
                      textarea.setSelectionRange(start + emoji.emoji.length, start + emoji.emoji.length);
                      onChange?.(textarea.value);
                    }
                  }}
                lazyLoadEmojis
             />)}
         
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger>Rule data</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-fit h-50 overflow-auto">
            {rulesPlaceholders.map((placeholder) => (
                <ContextMenuItem
                key={placeholder}
                onClick={() => {
                    const textarea = document.getElementById(id) as HTMLTextAreaElement;
                    if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;
                    textarea.value = text.substring(0, start) + `{${placeholder}}` + text.substring(end);
                    textarea.focus();
                    textarea.setSelectionRange(start + placeholder.length + 2, start + placeholder.length + 2);
                    onChange?.(textarea.value);
                    }
                }}
                >
                {emojiMap[placeholder] || placeholder}
                </ContextMenuItem>
            ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  </ContextMenu>
</div>

    );
}