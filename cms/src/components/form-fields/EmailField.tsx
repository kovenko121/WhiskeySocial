import React from 'react';
import { Form, Input } from 'antd';
import type { FormItemProps } from 'antd/es/form';
import type { InputProps } from 'antd/es/input';

export interface EmailFieldProps extends Omit<FormItemProps, 'children'> {
  inputProps?: InputProps;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  prefix?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Reusable email field component with built-in normalization and validation
 * Automatically lowercases and trims email input
 */
export const EmailField: React.FC<EmailFieldProps> = ({
  name = 'email',
  label = 'Email Address',
  required = false,
  rules = [],
  placeholder = 'email@example.com',
  disabled = false,
  size = 'middle',
  prefix,
  extra,
  value,
  onChange,
  inputProps = {},
  ...formItemProps
}) => {
  // Default email validation rules
  const defaultRules = [
    ...(required
      ? [{ required: true, message: 'Please enter an email address' }]
      : []),
    {
      type: 'email' as const,
      message: 'Please enter a valid email address',
    },
    ...rules,
  ];

  return (
    <Form.Item
      label={label}
      name={name}
      rules={defaultRules}
      normalize={(value) => value?.toLowerCase().trim()}
      extra={extra}
      {...formItemProps}
    >
      <Input
        type="email"
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        prefix={prefix}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
    </Form.Item>
  );
};
