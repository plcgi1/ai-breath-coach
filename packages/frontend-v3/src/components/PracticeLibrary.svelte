<script>
  import PracticeCard from './PracticeCard.svelte';
  export let techniques = [];
  export let selectedSlug = '';
  export let onSelect;
  export let onStart;
</script>

<div class="library-container">
  <div class="list">
    {#each techniques as tech}
      <PracticeCard {tech} isActive={selectedSlug === tech.slug} {onSelect} {onStart} />
    {/each}
  </div>
</div>

<style>
  .library-container {
    padding: 20px;
    padding-bottom: 100px; /* место под табы */
  }
  .list {
    display: flex;
    flex-direction: column;
  }
</style>
