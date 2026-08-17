<script lang="ts">
  import SettingButtonsRow from '$lib/components/shared-components/settings/SystemConfigButtonRow.svelte';
  import SettingSwitch from '$lib/components/shared-components/settings/SettingSwitch.svelte';
  import { featureFlagsManager } from '$lib/managers/feature-flags-manager.svelte';
  import { systemConfigManager } from '$lib/managers/system-config-manager.svelte';
  import { t } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  const disabled = $derived(featureFlagsManager.value.configFile);
  let configToEdit = $state(systemConfigManager.cloneValue());
</script>

<div class="mt-2">
  <div in:fade={{ duration: 500 }}>
    <form autocomplete="off" class="mx-4 mt-4" onsubmit={(event) => event.preventDefault()}>
      <div class="ms-4 mt-4 flex flex-col gap-4">
        <SettingSwitch
          title={$t('admin.je_customizations_auto_share_albums')}
          subtitle={$t('admin.je_customizations_auto_share_albums_description')}
          bind:checked={configToEdit.jeCustomizations.autoShareAlbums}
          {disabled}
        />
        <SettingSwitch
          title={$t('admin.je_customizations_admin_only_album_creation')}
          subtitle={$t('admin.je_customizations_admin_only_album_creation_description')}
          bind:checked={configToEdit.jeCustomizations.adminOnlyAlbumCreation}
          {disabled}
        />
      </div>

      <SettingButtonsRow bind:configToEdit keys={['jeCustomizations']} {disabled} />
    </form>
  </div>
</div>
