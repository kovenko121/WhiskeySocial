import { useCustomMutation } from '@refinedev/core';
import { message } from 'antd';
import { useState } from 'react';

const RESET_PASSWORD_MUTATION = `
  mutation ResetCMSUserPassword($userId: String!) {
    resetCMSUserPassword(userId: $userId) {
      statusCode
      success
      message
    }
  }
`;

const DELETE_CMS_USER_MUTATION = `
  mutation DeleteCMSUserWithAuth($userId: String!) {
    deleteCMSUserWithAuth(userId: $userId) {
      statusCode
      success
      message
      deletedUserId
    }
  }
`;

type ActionResult = { success: boolean; message: string };

/**
 * WHI-112 — admin-only CMS user actions (password reset + access removal).
 * Backed by the resetCMSUserPassword / deleteCMSUserWithAuth mutations
 * (UpdateCMSUser Lambda). Callers handle their own confirmation UI + refresh.
 */
export const useCMSUserAdminActions = () => {
  const { mutate } = useCustomMutation();
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const runMutation = (
    query: string,
    queryName: 'resetCMSUserPassword' | 'deleteCMSUserWithAuth',
    userId: string
  ): Promise<ActionResult> =>
    new Promise((resolve) => {
      mutate(
        {
          url: '',
          method: 'post',
          meta: { query, queryName, variables: { userId } },
          values: {},
        },
        {
          onSuccess: (data) => {
            const payload = data?.data as ActionResult | undefined;
            resolve({
              success: Boolean(payload?.success),
              message:
                payload?.message ||
                (payload?.success ? 'Success' : 'The operation failed'),
            });
          },
          onError: (err: any) => {
            resolve({
              success: false,
              message: err?.message || 'An unexpected error occurred',
            });
          },
        }
      );
    });

  const resetPassword = async (userId: string): Promise<boolean> => {
    setIsResetting(true);
    try {
      const result = await runMutation(
        RESET_PASSWORD_MUTATION,
        'resetCMSUserPassword',
        userId
      );
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
      return result.success;
    } finally {
      setIsResetting(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const result = await runMutation(
        DELETE_CMS_USER_MUTATION,
        'deleteCMSUserWithAuth',
        userId
      );
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
      return result.success;
    } finally {
      setIsDeleting(false);
    }
  };

  return { resetPassword, deleteUser, isResetting, isDeleting };
};
