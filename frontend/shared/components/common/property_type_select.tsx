'use client';

import { cn } from '@/lib/utils';
import { ALL_PROPERTY_TYPES, PROPERTY_TYPE_ICONS, PROPERTY_TYPE_LABELS } from '@/features/properties/constants/property_types';
import type { PropertyType } from '@/shared/types';

interface PropertyTypeSelectProps {
  value: PropertyType | '';
  onChange: (v: PropertyType) => void;
  multiple?: false;
  className?: string;
}

interface PropertyTypeMultiSelectProps {
  value: PropertyType[];
  onChange: (v: PropertyType[]) => void;
  multiple: true;
  className?: string;
}

type Props = PropertyTypeSelectProps | PropertyTypeMultiSelectProps;

export function PropertyTypeSelect(props: Props) {
  const { className } = props;

  function isSelected(type: PropertyType) {
    if (props.multiple) return (props.value as PropertyType[]).includes(type);
    return props.value === type;
  }

  function handleClick(type: PropertyType) {
    if (props.multiple) {
      const current = props.value as PropertyType[];
      props.onChange(
        current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
      );
    } else {
      (props as PropertyTypeSelectProps).onChange(type);
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {ALL_PROPERTY_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => handleClick(type)}
          className={cn(
            'flex items-center gap-1.5 rounded-none border px-3 py-1.5 text-sm transition-colors',
            isSelected(type)
              ? 'border-hairline-strong bg-parchment-deep text-ink'
              : 'border-hairline bg-parchment-deep/60 text-ink-muted hover:border-hairline-strong hover:text-ink',
          )}
        >
          <span>{PROPERTY_TYPE_ICONS[type]}</span>
          <span>{PROPERTY_TYPE_LABELS[type]}</span>
        </button>
      ))}
    </div>
  );
}
